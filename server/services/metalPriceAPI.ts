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
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.METALS_API_KEY || '';
    this.baseUrl = 'https://api.metalpriceapi.com/v1';
  }

  async getCurrentPrices(currency: string = 'USD'): Promise<MetalPriceData | null> {
    try {
      // Metal Price API format: https://api.metalpriceapi.com/v1/latest
      // Fetch prices with the requested base currency
      const response = await axios.get(`${this.baseUrl}/latest`, {
        params: {
          api_key: this.apiKey,
          base: currency.toUpperCase(),
          currencies: 'XAU,XAG,XPT,XPD', // Gold, Silver, Platinum, Palladium
        },
      });

      if (response.data && response.data.rates) {
        const rates = response.data.rates;
        
        // Metal Price API returns inverse rates
        // For any base currency: 1 CURRENCY = X ounces, so price = 1/X
        // This works for USD, EUR, GBP, INR, etc.
        return {
          gold: rates.XAU ? (1 / rates.XAU) : 0,
          silver: rates.XAG ? (1 / rates.XAG) : 0,
          platinum: rates.XPT ? (1 / rates.XPT) : 0,
          palladium: rates.XPD ? (1 / rates.XPD) : 0,
          timestamp: response.data.timestamp || Math.floor(Date.now() / 1000),
        };
      }

      return null;
    } catch (error: any) {
      console.error(`Error fetching metal prices for ${currency}:`, error.message || error);
      
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Using mock price data for ${currency}`);
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
      // Metal Price API historical endpoint
      const response = await axios.get(`${this.baseUrl}/timeframe`, {
        params: {
          api_key: this.apiKey,
          start_date: startDate,
          end_date: endDate,
          base: currency,
          currencies: metal,
        },
      });

      if (response.data && response.data.rates) {
        // Convert the rates object to an array
        const rates = response.data.rates;
        return Object.keys(rates).map(date => ({
          date,
          rate: rates[date][metal],
          price: rates[date][metal] ? (1 / rates[date][metal]) : 0,
        }));
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching historical prices:', error.message || error);
      return [];
    }
  }
}

export default new MetalPriceAPI();
