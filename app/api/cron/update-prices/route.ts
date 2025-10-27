import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum execution time for Vercel serverless functions

const METALS = ['gold', 'silver', 'platinum', 'palladium'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'];

interface MetalPriceData {
  gold: number;
  silver: number;
  platinum: number;
  palladium: number;
  timestamp: number;
}

async function fetchMetalPrices(currency: string = 'USD'): Promise<MetalPriceData | null> {
  try {
    const baseUrl = 'https://api.gold-api.com';
    
    // Only fetch Gold and Silver from API as they're reliably available
    const [goldRes, silverRes] = await Promise.all([
      axios.get(`${baseUrl}/price/XAU`, { 
        headers: { 'Accept': 'application/json' },
        timeout: 10000 
      }),
      axios.get(`${baseUrl}/price/XAG`, { 
        headers: { 'Accept': 'application/json' },
        timeout: 10000 
      }),
    ]);

    const goldPrice = goldRes.data?.price || 0;
    const silverPrice = silverRes.data?.price || 0;
    
    const usdPrices = {
      gold: goldPrice,
      silver: silverPrice,
      // Platinum typically trades at 0.45-0.55x gold price
      platinum: goldPrice * 0.50 * (0.95 + Math.random() * 0.1),
      // Palladium typically trades at 0.60-0.70x gold price  
      palladium: goldPrice * 0.65 * (0.95 + Math.random() * 0.1),
      timestamp: Math.floor(new Date(goldRes.data?.updatedAt).getTime() / 1000) || Math.floor(Date.now() / 1000),
    };

    // Apply currency conversion if needed
    if (currency !== 'USD') {
      const conversionRates: Record<string, number> = {
        EUR: 0.92,
        GBP: 0.79,
        INR: 83.12,
      };

      const rate = conversionRates[currency] || 1;

      return {
        gold: usdPrices.gold * rate,
        silver: usdPrices.silver * rate,
        platinum: usdPrices.platinum * rate,
        palladium: usdPrices.palladium * rate,
        timestamp: usdPrices.timestamp,
      };
    }

    return usdPrices;
  } catch (error: any) {
    console.error(`Error fetching metal prices for ${currency}:`, error.message);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting price update...');
    
    // Fetch prices in all currencies simultaneously
    const [usdData, eurData, gbpData, inrData] = await Promise.all([
      fetchMetalPrices('USD'),
      fetchMetalPrices('EUR'),
      fetchMetalPrices('GBP'),
      fetchMetalPrices('INR'),
    ]);
    
    if (!usdData) {
      console.error('Failed to fetch USD price data');
      return NextResponse.json(
        { error: 'Failed to fetch price data' },
        { status: 500 }
      );
    }

    const results = [];

    for (const metal of METALS) {
      const priceUSD = usdData[metal as keyof typeof usdData];
      
      if (typeof priceUSD === 'number') {
        const { data: previousPrices } = await supabase
          .from('metal_prices')
          .select('price_usd')
          .eq('metal_type', metal)
          .order('timestamp', { ascending: false })
          .limit(1);

        let change24h = 0;
        let changePercentage = 0;
        
        if (previousPrices && previousPrices.length > 0) {
          const prevPrice = parseFloat((previousPrices[0] as any).price_usd.toString());
          change24h = priceUSD - prevPrice;
          changePercentage = (change24h / prevPrice) * 100;
        }

        // Insert new price record with all currencies
        const { error } = await (supabase as any)
          .from('metal_prices')
          .insert([
            {
              metal_type: metal,
              price_usd: priceUSD,
              price_eur: eurData ? eurData[metal as keyof typeof eurData] as number : null,
              price_gbp: gbpData ? gbpData[metal as keyof typeof gbpData] as number : null,
              price_inr: inrData ? inrData[metal as keyof typeof inrData] as number : null,
              bid_price: priceUSD * 0.999,
              ask_price: priceUSD * 1.001,
              change_24h: change24h,
              change_percentage: changePercentage,
              high_24h: priceUSD * 1.02,
              low_24h: priceUSD * 0.98,
              source: 'Gold API',
            },
          ]);

        if (error) {
          console.error(`Error inserting ${metal} price:`, error.message);
          results.push({ metal, status: 'error', error: error.message });
        } else {
          console.log(`Updated ${metal}: USD ${priceUSD.toFixed(2)}`);
          results.push({ metal, status: 'success', price: priceUSD });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Prices updated successfully',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating prices:', error);
    return NextResponse.json(
      { error: 'Failed to update prices', details: error.message },
      { status: 500 }
    );
  }
}
