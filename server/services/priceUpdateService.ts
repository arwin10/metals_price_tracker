import cron from 'node-cron';
import { supabase } from '../config/database';
import metalPriceAPI from './metalPriceAPI';
import { Database } from '../../lib/database.types';

type MetalPriceRow = Database['public']['Tables']['metal_prices']['Row'];
type PriceAlertRow = Database['public']['Tables']['price_alerts']['Row'];

const METALS = ['gold', 'silver', 'platinum', 'palladium'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'];

export const updatePrices = async () => {
  try {
    console.log('Updating metal prices...');
    
    // Fetch prices in all currencies simultaneously
    const [usdData, eurData, gbpData, inrData] = await Promise.all([
      metalPriceAPI.getCurrentPrices('USD'),
      metalPriceAPI.getCurrentPrices('EUR'),
      metalPriceAPI.getCurrentPrices('GBP'),
      metalPriceAPI.getCurrentPrices('INR'),
    ]);
    
    if (!usdData) {
      console.error('Failed to fetch USD price data');
      return;
    }

    for (const metal of METALS) {
      const priceUSD = usdData[metal as keyof typeof usdData];
      
      if (typeof priceUSD === 'number') {
        const { data: previousPrices } = await supabase
          .from('metal_prices')
          .select('price_usd')
          .eq('metal_type', metal)
          .order('timestamp', { ascending: false })
          .limit(1) as { data: MetalPriceRow[] | null };

        let change24h = 0;
        let changePercentage = 0;
        
        if (previousPrices && previousPrices.length > 0) {
          const prevPrice = parseFloat(previousPrices[0].price_usd.toString());
          change24h = priceUSD - prevPrice;
          changePercentage = (change24h / prevPrice) * 100;
        }

        // Insert new price record with all currencies
        // @ts-ignore - Supabase type inference issue
        const { error } = await supabase
          .from('metal_prices')
          .insert([
            {
              metal_type: metal,
              price_usd: priceUSD,
              price_eur: eurData ? eurData[metal as keyof typeof eurData] as number : null,
              price_gbp: gbpData ? gbpData[metal as keyof typeof gbpData] as number : null,
              price_inr: inrData ? inrData[metal as keyof typeof inrData] as number : null,
              bid_price: priceUSD * 0.999, // Mock bid price (0.1% spread)
              ask_price: priceUSD * 1.001, // Mock ask price (0.1% spread)
              change_24h: change24h,
              change_percentage: changePercentage,
              high_24h: priceUSD * 1.02, // Mock high
              low_24h: priceUSD * 0.98, // Mock low
              source: 'Metal Price API',
            },
          ]);

        if (error) {
          console.error(`Error inserting ${metal} price:`, error.message);
        } else {
          console.log(`Updated ${metal}: USD ${priceUSD.toFixed(2)}`);
        }
      }
    }
    
    console.log('Prices updated successfully for all currencies (USD, EUR, GBP, INR)');
    
    // Check and trigger alerts
    await checkPriceAlerts();
  } catch (error) {
    console.error('Error updating prices:', error);
  }
};

export const checkPriceAlerts = async () => {
  try {
    // Get all active alerts with user email
    const { data: alerts, error: alertsError } = await supabase
      .from('price_alerts')
      .select(`
        *,
        users!price_alerts_user_id_fkey(email)
      `)
      .eq('is_active', true) as { data: PriceAlertRow[] | null; error: any };

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError.message);
      return;
    }

    if (!alerts || alerts.length === 0) {
      return;
    }

    for (const alert of alerts) {
      // Get current price
      const { data: priceData } = await supabase
        .from('metal_prices')
        .select('price_usd')
        .eq('metal_type', alert.metal_type)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single() as { data: MetalPriceRow | null };

      if (priceData) {
        const currentPrice = parseFloat(priceData.price_usd.toString());
        const targetPrice = parseFloat(alert.target_price.toString());
        const condition = alert.condition;

        let triggered = false;
        
        if (condition === 'above' && currentPrice >= targetPrice) {
          triggered = true;
        } else if (condition === 'below' && currentPrice <= targetPrice) {
          triggered = true;
        }

        if (triggered) {
          // Record alert trigger
          // @ts-ignore - Supabase type inference issue
          await supabase
            .from('alert_history')
            .insert([
              {
                alert_id: alert.id,
                triggered_price: currentPrice,
                notification_sent: false,
              },
            ]);

          // Update alert
          // @ts-ignore - Supabase type inference issue
          await supabase
            .from('price_alerts')
            .update({ triggered_at: new Date().toISOString() })
            .eq('id', alert.id);

          const userEmail = (alert as any).users?.email || 'unknown';
          console.log(`Alert triggered for user ${userEmail}: ${alert.metal_type} ${condition} ${targetPrice}`);
          
          // TODO: Send email notification
        }
      }
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
};

export const startPriceUpdateCron = () => {
  const interval = process.env.PRICE_UPDATE_INTERVAL || '5';
  const cronExpression = `*/${interval} * * * *`; // Every X minutes
  
  cron.schedule(cronExpression, () => {
    updatePrices();
  });
  
  // Run immediately on startup
  updatePrices();
  
  console.log(`Price update cron job scheduled (every ${interval} minutes)`);
};
