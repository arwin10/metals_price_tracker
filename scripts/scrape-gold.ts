
import { chromium } from 'playwright';

async function scrapeGoldPrices() {
    console.log('Starting gold price scraper...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const page = await context.newPage();

    try {
        const url = 'https://www.goodreturns.in/gold-rates/';
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Extract 22k Gold Price (Header Bar)
        // Selector: //a[contains(., '22k Gold')]/div/span or text match
        // Based on inspection: the header bar might be dynamic. Let's try multiple approaches.

        // Approach 1: Specific selectors found during manual inspection
        // 22k Gold
        const price22kElement = await page.locator("xpath=//a[contains(., '22k Gold')]/div/span").first();
        let price22kText = await price22kElement.textContent().catch(() => null);

        // 24k Gold (Intro Paragraph)
        const price24kElement = await page.locator("xpath=//p[contains(., 'The price of gold in India today is') and contains(., 'per gram for 24 karat gold')]").first();
        let price24kText = await price24kElement.textContent().catch(() => null);

        // Fallback Approach: Table extraction if header/paragraph fails
        if (!price22kText || !price24kText) {
            console.log('Main selectors failed, trying fallback table...');
            // Try to find the rates table
            const table22k = await page.locator("xpath=//h2[contains(., '22 Carat Gold')]/following-sibling::div//tr[contains(., '1 Gram')]").first();
            if (await table22k.count() > 0) {
                price22kText = await table22k.textContent();
            }

            const table24k = await page.locator("xpath=//h2[contains(., '24 Carat Gold')]/following-sibling::div//tr[contains(., '1 Gram')]").first();
            if (await table24k.count() > 0) {
                price24kText = await table24k.textContent();
            }
        }

        // Parse Prices
        const parsePrice = (text: string | null) => {
            if (!text) return null;
            const match = text.match(/₹\s*([0-9,]+)/);
            return match ? parseFloat(match[1].replace(/,/g, '')) : null;
        };

        const price22k = parsePrice(price22kText);
        const price24k = parsePrice(price24kText);

        if (price22k) console.log(`✓ 22k Gold Price: ₹${price22k}`);
        else console.log('✗ Failed to extract 22k Gold Price');

        if (price24k) console.log(`✓ 24k Gold Price: ₹${price24k}`);
        else console.log('✗ Failed to extract 24k Gold Price');

        return {
            price22k,
            price24k,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error scraping gold prices:', error);
    } finally {
        await browser.close();
    }
}

// Check if running directly
if (require.main === module) {
    scrapeGoldPrices();
}

export default scrapeGoldPrices;
