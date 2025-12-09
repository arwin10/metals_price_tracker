
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = 'http://localhost:5001/api';
const EMAIL = `test_${Date.now()}@gmail.com`;
const PASSWORD = 'password123';

import { createClient } from '@supabase/supabase-js';

async function runVerification() {
    console.log('🚀 Starting Portfolio Verification...');

    try {
        // Initialize Supabase Admin
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 1. Create Confirmed User via Admin
        console.log(`\n1. Creating confirmed user: ${EMAIL}`);
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: EMAIL,
            password: PASSWORD,
            email_confirm: true
        });

        if (userError) throw userError;
        const userId = userData.user.id;
        console.log('✅ User Created:', userId);

        // Create user profile in public.users table (mimicking the register route)
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                email: EMAIL,
                first_name: 'Test',
                last_name: 'User'
            });

        if (profileError) console.warn('⚠️ Profile creation warning:', profileError.message);


        // 2. Login to get token
        console.log('\n2. Logging in...');
        // We can use the admin client to sign in or just use the backend API.
        // Let's use the backend API to verify it works for confirmed users.
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.session.access_token;
        console.log('✅ Logged in. Token received.');

        const headers = { Authorization: `Bearer ${token}` };

        // 3. Create Portfolio
        console.log('\n3. Creating Portfolio...');
        const portfolioRes = await axios.post(`${API_URL}/portfolio`, {
            name: 'My Retirement Fund',
            description: 'Long term gold investment'
        }, { headers });
        const portfolioId = portfolioRes.data.portfolio.id;
        console.log(`✅ Portfolio Created: ID ${portfolioId}`);

        // 4. Add Holding
        console.log('\n4. Adding Holding (Gold)...');
        const holdingRes = await axios.post(`${API_URL}/portfolio/${portfolioId}/holdings`, {
            metalType: 'gold',
            quantity: 10,
            unit: 'oz',
            purchasePrice: 1900,
            purchaseDate: new Date().toISOString().split('T')[0],
            notes: 'Bought at dip'
        }, { headers });
        console.log('✅ Holding Added:', holdingRes.data.holding.id);

        // 5. Get Portfolio Details
        console.log('\n5. Fetching Portfolio Details...');
        const detailsRes = await axios.get(`${API_URL}/portfolio/${portfolioId}`, { headers });
        const p = detailsRes.data;
        console.log('✅ Portfolio Details Retrieved');
        console.log(`   Total Invested: $${p.summary.totalInvested}`);
        console.log(`   Current Value: $${p.summary.totalCurrentValue}`);
        console.log(`   Holdings Count: ${p.holdings.length}`);

        if (p.holdings.length !== 1) throw new Error('Expected 1 holding');
        if (p.summary.totalInvested !== 19000) throw new Error('Expected total invested 19000');

        // 6. Delete Portfolio
        console.log('\n6. Deleting Portfolio...');
        await axios.delete(`${API_URL}/portfolio/${portfolioId}`, { headers });
        console.log('✅ Portfolio Deleted');

        // 7. Verify Deletion
        console.log('\n7. Verifying Deletion...');
        try {
            await axios.get(`${API_URL}/portfolio/${portfolioId}`, { headers });
            throw new Error('Portfolio should be deleted but was found');
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log('✅ Portfolio correctly returned 404');
            } else {
                throw error;
            }
        }

        console.log('\n🎉 ALL TESTS PASSED!');

    } catch (error: any) {
        console.error('\n❌ Verification Failed:');
        if (error.response) {
            console.error('Analysis:', error.response.status, error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runVerification();
