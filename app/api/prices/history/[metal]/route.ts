import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { metal: string } }
) {
  try {
    const metal = params.metal;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const currency = searchParams.get('currency') || 'USD';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
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

    const priceKey = `price_${currency.toLowerCase()}` as 'price_usd' | 'price_eur' | 'price_gbp' | 'price_inr';

    const prices = data?.map((row: any) => ({
      metal: row.metal_type,
      price: row[priceKey] || row.price_usd,
      change24h: row.change_24h ? parseFloat(row.change_24h.toString()) : 0,
      changePercentage: row.change_percentage ? parseFloat(row.change_percentage.toString()) : 0,
      timestamp: row.timestamp,
    })) || [];

    return NextResponse.json({ metal, prices, currency, startDate, endDate });
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical prices' },
      { status: 500 }
    );
  }
}
