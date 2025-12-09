
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const EMAIL = process.argv[2];

if (!EMAIL) {
    console.error('Please provide an email address as an argument');
    process.exit(1);
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function makeAdmin() {
    console.log(`Promoting ${EMAIL} to admin...`);

    // 1. Get user ID from email (using rpc if available, or just query users table)
    // Since public.users is keyed by ID, we need to find the ID first.
    // We can query public.users
    const { data: user, error: findError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', EMAIL)
        .single();

    if (findError || !user) {
        console.error('User not found in public.users table');
        process.exit(1);
    }

    // 2. Update role
    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ role: 'admin' })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating role:', updateError);
        process.exit(1);
    }

    console.log(`✅ Successfully promoted ${EMAIL} to admin.`);
}

makeAdmin();
