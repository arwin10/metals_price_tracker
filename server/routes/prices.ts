import { Router, Response } from 'express';
import { supabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Database } from '../../lib/database.types';

type MetalPriceRow = Database['public']['Tables']['metal_prices']['Row'];

const router = Router();

// Get current prices for all metals
router.get('/current', async (req, res: Response) => {
  try {
    const { currency = 'USD' } = req.query;
    const currencyStr = currency.toString().toUpperCase();

    // Validate currency
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'INR'];
    if (!supportedCurrencies.includes(currencyStr)) {
      return res.status(400).json({ error: 'Unsupported currency. Supported: USD, EUR, GBP, INR' });
    }

    // Get latest price for each metal type
    const { data, error } = await supabase
      .from('metal_prices')
      .select('*')
      .in('metal_type', ['gold', 'gold_22k', 'silver', 'platinum', 'palladium'])
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    // Get the most recent price for each metal
    const latestPrices = new Map<string, MetalPriceRow>();
    data?.forEach((row: MetalPriceRow) => {
      if (!latestPrices.has(row.metal_type)) {
        latestPrices.set(row.metal_type, row);
      }
    });

    const priceColumnMap: Record<string, string> = {
      USD: 'price_usd',
      EUR: 'price_eur',
      GBP: 'price_gbp',
      INR: 'price_inr',
    };

    const priceColumn = priceColumnMap[currencyStr] || 'price_usd';

    const prices = Array.from(latestPrices.values()).map((row: MetalPriceRow) => ({
      metal: row.metal_type,
      price: row[priceColumn as keyof MetalPriceRow] as number || row.price_usd,
      bidPrice: row.bid_price,
      askPrice: row.ask_price,
      change24h: row.change_24h ? parseFloat(row.change_24h.toString()) : 0,
      changePercentage: row.change_percentage ? parseFloat(row.change_percentage.toString()) : 0,
      high24h: row.high_24h,
      low24h: row.low_24h,
      source: row.source,
      timestamp: row.timestamp,
    }));

    res.json({ prices, currency: currencyStr });
  } catch (error) {
    console.error('Error fetching current prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Get historical prices for a specific metal
router.get('/history/:metal', async (req, res: Response) => {
  try {
    const { metal } = req.params;
    const { startDate, endDate, currency = 'USD' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const { data, error } = await supabase
      .from('metal_prices')
      .select('metal_type, price_usd, price_eur, price_gbp, price_inr, change_24h, change_percentage, timestamp')
      .eq('metal_type', metal)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: true });

    if (error) {
      throw error;
    }

    const prices = data?.map((row: any) => ({
      metal: row.metal_type,
      price: row[`price_${currency.toString().toLowerCase()}` as keyof MetalPriceRow] as number || row.price_usd,
      change24h: row.change_24h ? parseFloat(row.change_24h.toString()) : 0,
      changePercentage: row.change_percentage ? parseFloat(row.change_percentage.toString()) : 0,
      timestamp: row.timestamp,
    })) || [];

    res.json({ metal, prices, currency, startDate, endDate });
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    res.status(500).json({ error: 'Failed to fetch historical prices' });
  }
});

// Get price statistics
router.get('/stats/:metal', async (req, res: Response) => {
  try {
    const { metal } = req.params;
    const { period = '30' } = req.query; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period as string));

    const { data, error } = await supabase
      .from('metal_prices')
      .select('price_usd')
      .eq('metal_type', metal)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified period' });
    }

    // Calculate statistics
    const prices = (data || []).map((row: any) => parseFloat(row.price_usd.toString()));
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Calculate standard deviation for volatility
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance);

    res.json({
      metal,
      period: `${period} days`,
      stats: {
        high,
        low,
        average,
        volatility,
      },
    });
  } catch (error) {
    console.error('Error fetching price statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
