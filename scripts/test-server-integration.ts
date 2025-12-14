
import metalPriceAPI from '../server/services/metalPriceAPI';

async function testIntegration() {
    console.log('Testing MetalPriceAPI integration...');

    // Concurrent calls - should only trigger one scrape
    console.log('--- Concurrent Requests (USD, EUR, GBP, INR) ---');
    const startConcurrent = Date.now();
    const results = await Promise.all([
        metalPriceAPI.getCurrentPrices('USD'),
        metalPriceAPI.getCurrentPrices('EUR'),
        metalPriceAPI.getCurrentPrices('GBP'),
        metalPriceAPI.getCurrentPrices('INR')
    ]);
    console.log('Time taken for 4 concurrent requests:', Date.now() - startConcurrent, 'ms');
    console.log('Result counts:', results.length);
    console.log('First result (USD):', results[0]);

    if (results[0] && results[1]) {
        console.log('Consistency Check (USD vs EUR):');
        console.log('USD Gold:', results[0].gold);
        console.log('EUR Gold:', results[1].gold);
    }
}

testIntegration();
