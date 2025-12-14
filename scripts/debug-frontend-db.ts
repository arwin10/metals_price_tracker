
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- Debugging Frontend DB Connection ---');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPrices() {
    console.log('Fetching latest prices...');
    const { data, error } = await supabase
        .from('metal_prices')
        .select('metal_type, price_usd, price_inr, price_eur, timestamp, source')
        .order('timestamp', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching prices:', error);
    } else {
        console.log('Latest 10 prices in DB:');
        console.table(data);
    }
}

checkPrices();
