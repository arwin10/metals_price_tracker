import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate environment variables at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: 'Supabase environment variables are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel dashboard.',
          debug: {
            hasSupabaseUrl: !!supabaseUrl,
            hasSupabaseKey: !!supabaseKey
          }
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const currency = searchParams.get('currency') || 'USD';
    const currencyStr = currency.toUpperCase();
    
    // Validate currency
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'INR'];
    if (!supportedCurrencies.includes(currencyStr)) {
      return NextResponse.json(
        { error: 'Unsupported currency. Supported: USD, EUR, GBP, INR' },
        { status: 400 }
      );
    }
    
    // Get latest price for each metal type
    const { data, error } = await supabase
      .from('metal_prices')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    // Get the most recent price for each metal
    const latestPrices = new Map<string, any>();
    data?.forEach((row: any) => {
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

    const prices = Array.from(latestPrices.values()).map((row: any) => ({
      metal: row.metal_type,
      price: row[priceColumn] || row.price_usd,
      bidPrice: row.bid_price,
      askPrice: row.ask_price,
      change24h: row.change_24h ? parseFloat(row.change_24h.toString()) : 0,
      changePercentage: row.change_percentage ? parseFloat(row.change_percentage.toString()) : 0,
      high24h: row.high_24h,
      low24h: row.low_24h,
      source: row.source,
      timestamp: row.timestamp,
    }));

    return NextResponse.json({ prices, currency: currencyStr });
  } catch (error: any) {
    console.error('Error fetching current prices:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch prices',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
