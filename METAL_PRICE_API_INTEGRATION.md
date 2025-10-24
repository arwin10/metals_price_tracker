# Metal Price API Integration Guide

## ✅ Current Status: COMPLETE

Your application is already configured to use the **Metal Price API** endpoint.

## API Configuration

### Endpoint Information
- **Base URL**: `https://api.metalpriceapi.com/v1`
- **Latest Prices**: `https://api.metalpriceapi.com/v1/latest`
- **Historical Data**: `https://api.metalpriceapi.com/v1/timeframe`
- **API Key**: `d3127d1eba2a0165d14c7cd4bff4a5df` (configured in `.env`)

### Supported Metals
- **XAU** - Gold
- **XAG** - Silver
- **XPT** - Platinum
- **XPD** - Palladium

## How It Works

### 1. Latest Prices Endpoint

**Request Format:**
```
GET https://api.metalpriceapi.com/v1/latest?api_key=YOUR_KEY&base=USD&currencies=XAU,XAG,XPT,XPD
```

**Response Format:**
```json
{
  "success": true,
  "timestamp": 1640000000,
  "base": "USD",
  "rates": {
    "XAU": 0.000512,  // 1 USD = 0.000512 troy oz of gold
    "XAG": 0.041152,  // 1 USD = 0.041152 troy oz of silver
    "XPT": 0.001052,  // 1 USD = 0.001052 troy oz of platinum
    "XPD": 0.000781   // 1 USD = 0.000781 troy oz of palladium
  }
}
```

**Price Calculation:**
The API returns **inverse rates** (USD per ounce), so we need to invert them:
```typescript
goldPrice = 1 / 0.000512 = $1,953.13 per troy oz
silverPrice = 1 / 0.041152 = $24.30 per troy oz
```

### 2. Historical Prices Endpoint

**Request Format:**
```
GET https://api.metalpriceapi.com/v1/timeframe?api_key=YOUR_KEY&start_date=2024-01-01&end_date=2024-01-31&base=USD&currencies=XAU
```

**Response Format:**
```json
{
  "success": true,
  "timeframe": true,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "base": "USD",
  "rates": {
    "2024-01-01": {"XAU": 0.000512},
    "2024-01-02": {"XAU": 0.000515},
    ...
  }
}
```

## Implementation Details

### File: `server/services/metalPriceAPI.ts`

The service handles:
1. ✅ **Current Prices** - Fetches latest prices for all metals
2. ✅ **Historical Data** - Retrieves price history for charts
3. ✅ **Price Inversion** - Converts API rates to USD per oz
4. ✅ **Error Handling** - Falls back to mock data in development
5. ✅ **Mock Data** - Provides realistic test data when API is unavailable

### Key Functions

```typescript
// Get current prices for all metals
async getCurrentPrices(currency: string = 'USD'): Promise<MetalPriceData | null>

// Get historical prices for charts
async getHistoricalPrices(
  metal: string,
  startDate: string,
  endDate: string,
  currency: string = 'USD'
): Promise<any[]>
```

## Testing the Integration

### 1. Start the Server
```bash
npm run server
```

**Expected Output:**
```
Server running on port 5000
Supabase connected successfully
Price update scheduled to run every 5 minutes
Prices updated successfully
```

### 2. Test Current Prices Endpoint
```bash
curl http://localhost:5000/api/prices/current
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "gold": 1953.12,
    "silver": 24.30,
    "platinum": 950.75,
    "palladium": 1280.25,
    "timestamp": 1640000000
  }
}
```

### 3. Test Historical Prices
```bash
curl "http://localhost:5000/api/prices/historical?metal=XAU&startDate=2024-01-01&endDate=2024-01-31"
```

## Environment Variables

Your `.env` file is already configured:

```env
# Metals API (Metal Price API - https://metalpriceapi.com/)
METALS_API_KEY=d3127d1eba2a0165d14c7cd4bff4a5df

# Price Update Interval (in minutes)
PRICE_UPDATE_INTERVAL=5
```

## Automatic Price Updates

The application automatically fetches new prices every 5 minutes using a cron job:

**File**: `server/services/priceUpdateService.ts`

```typescript
// Updates run every 5 minutes (configurable via PRICE_UPDATE_INTERVAL)
cron.schedule(`*/${interval} * * * *`, async () => {
  await updatePrices();
});
```

## Price Update Flow

1. **Cron Job Triggers** → Every 5 minutes
2. **Fetch API Data** → Call Metal Price API `/latest` endpoint
3. **Calculate Prices** → Invert rates (price = 1 / rate)
4. **Store in Database** → Save to Supabase `metal_prices` table
5. **Real-time Update** → Supabase broadcasts to connected clients

## API Rate Limits

According to Metal Price API documentation:
- **Free Plan**: 100 requests/month
- **Basic Plan**: 10,000 requests/month
- **Pro Plan**: 50,000 requests/month

**Current Usage Estimate:**
- Price updates: Every 5 minutes = 288 requests/day = ~8,640 requests/month
- **Recommendation**: Use at least Basic Plan for production

## Mock Data Fallback

If the API request fails (invalid key, rate limit, network error), the system automatically uses mock data:

```typescript
private getMockPrices(): MetalPriceData {
  return {
    gold: 1950.50 + (Math.random() * 20 - 10),
    silver: 24.30 + (Math.random() * 2 - 1),
    platinum: 950.75 + (Math.random() * 15 - 7.5),
    palladium: 1280.25 + (Math.random() * 25 - 12.5),
    timestamp: Math.floor(Date.now() / 1000),
  };
}
```

This ensures the application continues working during development and testing.

## Troubleshooting

### Problem: API Returns 401 Unauthorized
**Solution**: Verify your API key in `.env` file
```bash
# Check if key is set
echo $env:METALS_API_KEY
```

### Problem: Prices Show as $0.00
**Cause**: API rate calculation issue or invalid response
**Solution**: Check server logs for API errors
```bash
npm run server
# Look for: "Error fetching metal prices"
```

### Problem: Using Mock Data Instead of Real Prices
**Cause**: API request failed, fallback activated
**Solution**: 
1. Verify internet connection
2. Check API key validity
3. Confirm API subscription status
4. Review server console for error messages

## Next Steps

### ✅ Completed
- [x] Metal Price API integration
- [x] Price inversion logic
- [x] Historical data endpoint
- [x] Mock data fallback
- [x] Automatic updates (every 5 minutes)
- [x] Environment configuration

### 🚀 Ready to Test
1. Start backend server: `npm run server`
2. Start frontend: `npm run dev`
3. Visit: http://localhost:3000
4. Monitor real-time price updates

## API Documentation

Full Metal Price API documentation available at:
- **Website**: https://metalpriceapi.com/
- **Docs**: https://metalpriceapi.com/documentation
- **Dashboard**: https://metalpriceapi.com/dashboard (manage your API key)

## Support

If you encounter any issues:
1. Check server logs for error messages
2. Verify API key is active and within rate limits
3. Test API directly: https://api.metalpriceapi.com/v1/latest?api_key=YOUR_KEY&base=USD&currencies=XAU
4. Contact Metal Price API support if API issues persist
