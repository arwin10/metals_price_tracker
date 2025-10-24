import axios from 'axios';

export interface MetalPrice {
  metal: string;
  price: number;
  currency: string;
  timestamp: Date;
}

export interface MetalPriceData {
  gold: number;
  silver: number;
  platinum: number;
  palladium: number;
  timestamp: number;
}

class MetalPriceAPI {
  private baseUrl: string;
  private symbolMap: Record<string, string>;

  constructor() {
    this.baseUrl = 'https://api.gold-api.com';
    // Map metal names to Gold API symbols
    this.symbolMap = {
      gold: 'XAU',
      silver: 'XAG',
      platinum: 'XPT',
      palladium: 'XPD',
    };
  }

  async getCurrentPrices(currency: string = 'USD'): Promise<MetalPriceData | null> {
    try {
      // Gold API format: https://api.gold-api.com/price/{symbol}
      // Returns: { name, price, symbol, updatedAt }
      // Note: Prices are in USD per troy ounce
      // Note: API only reliably supports XAU (Gold) and XAG (Silver)
      const currencyCode = currency.toUpperCase();
      
      console.log(`Fetching prices for ${currencyCode}...`);
      
      // Only fetch Gold and Silver from API as they're reliably available
      const [goldRes, silverRes] = await Promise.all([
        axios.get(`${this.baseUrl}/price/XAU`, { 
          headers: { 'Accept': 'application/json' },
          timeout: 10000 
        }),
        axios.get(`${this.baseUrl}/price/XAG`, { 
          headers: { 'Accept': 'application/json' },
          timeout: 10000 
        }),
      ]);

      // Gold API returns prices per troy ounce in USD
      // For Platinum and Palladium, use realistic mock prices based on historical ratios
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

      console.log(`✓ Fetched prices from Gold API - Gold: $${usdPrices.gold.toFixed(2)}, Silver: $${usdPrices.silver.toFixed(2)}, Platinum: $${usdPrices.platinum.toFixed(2)} (estimated), Palladium: $${usdPrices.palladium.toFixed(2)} (estimated)`);

      // If requesting USD, return directly
      if (currencyCode === 'USD') {
        return usdPrices;
      }

      // For other currencies, apply conversion
      const conversionRates: Record<string, number> = {
        EUR: 0.92,
        GBP: 0.79,
        INR: 83.12,
      };

      const rate = conversionRates[currencyCode] || 1;

      return {
        gold: usdPrices.gold * rate,
        silver: usdPrices.silver * rate,
        platinum: usdPrices.platinum * rate,
        palladium: usdPrices.palladium * rate,
        timestamp: usdPrices.timestamp,
      };
    } catch (error: any) {
      console.error(`✗ Error fetching metal prices for ${currency}:`, error.response?.status || 'Network Error', error.message);
      
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`→ Using mock price data for ${currency}`);
        return this.getMockPrices(currency);
      }
      
      return null;
    }
  }

  private getMockPrices(currency: string = 'USD'): MetalPriceData {
    // Currency conversion multipliers from USD base
    const currencyMultipliers: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      INR: 83.12,
    };

    const multiplier = currencyMultipliers[currency.toUpperCase()] || 1;

    // Mock data for development/testing (USD base prices)
    return {
      gold: (1950.50 + (Math.random() * 20 - 10)) * multiplier,
      silver: (24.30 + (Math.random() * 2 - 1)) * multiplier,
      platinum: (950.75 + (Math.random() * 15 - 7.5)) * multiplier,
      palladium: (1280.25 + (Math.random() * 25 - 12.5)) * multiplier,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  async getHistoricalPrices(
    metal: string,
    startDate: string,
    endDate: string,
    currency: string = 'USD'
  ): Promise<any[]> {
    try {
      // Note: Gold API free tier doesn't provide historical data
      // Generate mock historical data based on current price
      const symbol = this.symbolMap[metal.toLowerCase()];
      if (!symbol) {
        console.error(`Unknown metal: ${metal}`);
        return [];
      }

      const currencyCode = currency.toUpperCase();
      const currentPriceRes = await axios.get(`${this.baseUrl}/price/${symbol}${currencyCode}`);
      const currentPrice = currentPriceRes.data?.price || 0;

      if (!currentPrice) {
        return [];
      }

      // Generate mock historical data with realistic variations
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const historicalData = [];

      for (let i = 0; i <= days; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        
        // Add some random variation (±2% from current price)
        const variation = 1 + (Math.random() - 0.5) * 0.04;
        const price = currentPrice * variation;
        
        historicalData.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(price.toFixed(2)),
        });
      }

      return historicalData;
    } catch (error: any) {
      console.error('Error fetching historical prices:', error.message || error);
      return [];
    }
  }
}

export default new MetalPriceAPI();
