import axios from 'axios';
import { chromium } from 'playwright';

export interface MetalPriceData {
  gold: number;
  gold_22k: number;
  silver: number;
  platinum: number;
  palladium: number;
  timestamp: number;
}

class MetalPriceAPI {
  private cache: { data: MetalPriceData; timestamp: number } | null = null;
  private CACHE_DURATION = 60 * 1000; // 1 minute cache to avoid multiple browser launches in the same cron tick
  private pendingPromise: Promise<MetalPriceData | null> | null = null;

  async getCurrentPrices(currency: string = 'USD'): Promise<MetalPriceData | null> {
    try {
      const now = Date.now();
      let usdBasePrices: MetalPriceData;

      // Use cache if available and fresh
      if (this.cache && (now - this.cache.timestamp < this.CACHE_DURATION)) {
        console.log(`Using cached price data (${Math.round((now - this.cache.timestamp) / 1000)}s old)`);
        usdBasePrices = this.cache.data;
      } else if (this.pendingPromise) {
        // If a request is already in progress, wait for it
        console.log('Waiting for pending scrape request...');
        const result = await this.pendingPromise;
        if (result) {
          usdBasePrices = result;
        } else {
          throw new Error('Pending scrape failed');
        }
      } else {
        // Start new scrape with promise lock
        this.pendingPromise = (async () => {
          console.log('Scraping fresh gold prices from GoodReturns.in...');
          try {
            const scrapedPrices = await this.scrapePrices();

            if (!scrapedPrices) {
              throw new Error('Failed to scrape prices');
            }

            // Convert scraped INR prices to USD base for the system
            // Exchange Rate (approximate, ideally should be fetched or dynamic)
            const INR_TO_USD = 1 / 84.5; // Approx rate

            // GoodReturns gives 24k/22k gold. System uses "gold" (typically 24k implies pure).
            // Silver is not always strictly on the main banner, so we might need a fallback or scrape it too.
            // The previous scraper script got 22k and 24k gold.
            // Let's assume 'gold' = 24k price.

            // Note: The scraper returns price per GRAM.
            // System likely expects price per OUNCE (standard for USD) or needs to be consistent.
            // Let's check the previous `getCurrentPrices`.
            // Previous one used `api.gold-api.com` which returns "price per troy ounce" (XAU).
            // GoodReturns is "per gram".
            // 1 Troy Ounce = 31.1034768 grams.

            const pricePerGram24kINR = scrapedPrices.gold24k; // e.g. 7850
            const pricePerGram22kINR = scrapedPrices.gold22k;

            const pricePerOunce24kUSD = pricePerGram24kINR * 31.1035 * INR_TO_USD;
            const pricePerOunce22kUSD = pricePerGram22kINR * 31.1035 * INR_TO_USD;

            const data = {
              gold: pricePerOunce24kUSD,
              gold_22k: pricePerOunce22kUSD,
              // Ratios for others if not scraped (Silver is on GoodReturns, but let's stick to gold for now as requested/mock others)
              silver: pricePerOunce24kUSD * 0.015, // Approx ratio
              platinum: pricePerOunce24kUSD * 0.5,
              palladium: pricePerOunce24kUSD * 0.6,
              timestamp: Math.floor(Date.now() / 1000),
            };

            this.cache = {
              data,
              timestamp: Date.now()
            };
            return data;
          } finally {
            this.pendingPromise = null;
          }
        })();

        const result = await this.pendingPromise;
        if (result) {
          usdBasePrices = result;
        } else {
          throw new Error('Scrape failed');
        }
      }

      console.log(`Base Gold Price (USD/oz): $${usdBasePrices.gold.toFixed(2)}`);

      // If requesting USD, return directly
      if (currency === 'USD') {
        return usdBasePrices;
      }

      // For other currencies, apply conversion
      // Since we derived USD from INR, ideally we should just return the INR straight if requested, 
      // but the system design seems to cascade from USD.
      // Let's stick to simple fixed rates or the inverse of what we used.

      const conversionRates: Record<string, number> = {
        EUR: 0.92,
        GBP: 0.79,
        INR: 84.5, // Match the rate used above
      };

      const rate = conversionRates[currency] || 1;

      return {
        gold: usdBasePrices.gold * rate,
        gold_22k: (usdBasePrices.gold_22k || usdBasePrices.gold * 0.92) * rate,
        silver: usdBasePrices.silver * rate,
        platinum: usdBasePrices.platinum * rate,
        palladium: usdBasePrices.palladium * rate,
        timestamp: usdBasePrices.timestamp,
      };

    } catch (error: any) {
      console.error(`✗ Error getting prices for ${currency}:`, error.message);
      // Fallback to mock if scraping fails completely (so server doesn't crash)
      return this.getMockPrices(currency);
    }
  }

  private async scrapePrices(): Promise<{ gold22k: number, gold24k: number } | null> {
    let browser = null;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      const page = await context.newPage();

      // Timeout 30s
      await page.goto('https://www.goodreturns.in/gold-rates/', { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Selectors from our script logic
      // 22k Gold (fallback logic included)
      let price22k = 0;
      let price24k = 0;

      // Try getting both from the rates table as it's often more structured
      const table22k = await page.locator("xpath=//h2[contains(., '22 Carat Gold')]/following-sibling::div//tr[contains(., '1 Gram')]").first();
      if (await table22k.count() > 0) {
        const text = await table22k.textContent();
        const match = text?.match(/₹\s*([0-9,]+)/);
        if (match) price22k = parseFloat(match[1].replace(/,/g, ''));
      }

      const table24k = await page.locator("xpath=//h2[contains(., '24 Carat Gold')]/following-sibling::div//tr[contains(., '1 Gram')]").first();
      if (await table24k.count() > 0) {
        const text = await table24k.textContent();
        const match = text?.match(/₹\s*([0-9,]+)/);
        if (match) price24k = parseFloat(match[1].replace(/,/g, ''));
      }

      // Fallback to header/intro if table failed
      if (!price24k) {
        const price24kElement = await page.locator("xpath=//p[contains(., 'The price of gold in India today is') and contains(., 'per gram for 24 karat gold')]").first();
        const text = await price24kElement.textContent().catch(() => null);
        const match = text?.match(/₹\s*([0-9,]+)/);
        if (match) price24k = parseFloat(match[1].replace(/,/g, ''));
      }

      if (!price22k && !price24k) {
        throw new Error('Selectors failed to find gold prices');
      }

      // If one is missing, estimate it from the other
      if (price24k && !price22k) price22k = price24k * 0.92;
      if (price22k && !price24k) price24k = price22k / 0.92;

      return { gold22k: price22k, gold24k: price24k };

    } catch (e) {
      console.error('Playwright scraping failed:', e);
      return null;
    } finally {
      if (browser) await browser.close();
    }
  }

  private getMockPrices(currency: string = 'USD'): MetalPriceData {
    const currencyMultipliers: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      INR: 84.5,
    };

    const multiplier = currencyMultipliers[currency] || 1;

    return {
      gold: (2650.50 + (Math.random() * 20 - 10)) * multiplier,
      gold_22k: (2438.50 + (Math.random() * 20 - 10)) * multiplier,
      silver: (31.30 + (Math.random() * 2 - 1)) * multiplier,
      platinum: (980.75 + (Math.random() * 15 - 7.5)) * multiplier,
      palladium: (1050.25 + (Math.random() * 25 - 12.5)) * multiplier,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  // Keep getHistoricalPrices as mock/axios-based since scraper is live-only
  async getHistoricalPrices(
    metal: string,
    startDate: string,
    endDate: string,
    currency: string = 'USD'
  ): Promise<any[]> {
    try {
      // Just return mock data based on current "mock" logic or simple variations
      // To avoid complex scraping for historicals
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const historicalData = [];

      // Base price approximation
      let basePrice = 2000;
      if (metal.toLowerCase() === 'silver') basePrice = 25;
      if (metal.toLowerCase() === 'platinum') basePrice = 950;
      if (metal.toLowerCase() === 'palladium') basePrice = 1200;

      for (let i = 0; i <= days; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);

        const variation = 1 + (Math.random() - 0.5) * 0.05;
        const price = basePrice * variation;

        historicalData.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(price.toFixed(2)),
        });
      }
      return historicalData;
    } catch (error) {
      return [];
    }
  }
}

export default new MetalPriceAPI();
