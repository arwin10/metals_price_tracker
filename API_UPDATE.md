# Metal Price API Update

## ✅ API Migration Complete

The application has been updated to use the **Metal Price API** instead of the previous Metals API.

### New API Details

**Endpoint**: `https://api.metalpriceapi.com/v1/latest`
**Website**: https://metalpriceapi.com/
**Documentation**: https://metalpriceapi.com/documentation

### What Changed

#### 1. **API Endpoint**
- **Old**: `https://metals-api.com/api/latest`
- **New**: `https://api.metalpriceapi.com/v1/latest`

#### 2. **API Parameters**
- **Old**: `access_key`, `symbols`
- **New**: `api_key`, `currencies`

#### 3. **Price Calculation**
- **Old**: Prices were per gram, converted to troy ounce (× 31.1035)
- **New**: Prices are inverted rates (1 / rate) as the API returns metal-to-currency ratios

### API Response Format

The Metal Price API returns data in this format:

```json
{
  "success": true,
  "timestamp": 1698156789,
  "base": "USD",
  "rates": {
    "XAU": 0.0005123,  // 1 USD = 0.0005123 oz of gold
    "XAG": 0.0412,     // 1 USD = 0.0412 oz of silver
    "XPT": 0.00104,    // 1 USD = 0.00104 oz of platinum
    "XPD": 0.00082     // 1 USD = 0.00082 oz of palladium
  }
}
```

To get the price per ounce in USD, we invert the rate:
```javascript
goldPrice = 1 / rates.XAU  // $1950.50 per oz
```

### Supported Metals

- **XAU** - Gold
- **XAG** - Silver
- **XPT** - Platinum
- **XPD** - Palladium

### Supported Currencies

- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- INR (Indian Rupee)
- And 150+ more currencies

### Getting an API Key

1. Visit https://metalpriceapi.com/
2. Sign up for a free account
3. Free plan includes:
   - 50 requests per month
   - Real-time data
   - Historical data access
4. Copy your API key
5. Update `.env` file:
   ```env
   METALS_API_KEY=your-api-key-here
   ```

### API Limits

#### Free Plan
- ✅ 50 API requests/month
- ✅ Real-time prices
- ✅ Historical data
- ✅ Multiple currencies

#### Paid Plans
- **Basic**: $10/month - 5,000 requests
- **Professional**: $50/month - 50,000 requests
- **Enterprise**: Custom pricing

### Environment Variables

The `.env` file has been updated:

```env
# Metals API (Metal Price API - https://metalpriceapi.com/)
# API endpoint: https://api.metalpriceapi.com/v1/latest
METALS_API_KEY=your-api-key-here
```

**Note**: The `METALS_API_URL` variable has been removed as the endpoint is now hardcoded in the service.

### Code Changes

#### File: `server/services/metalPriceAPI.ts`

**Key Changes**:
1. Base URL updated to `https://api.metalpriceapi.com/v1`
2. Parameter changed from `access_key` to `api_key`
3. Parameter changed from `symbols` to `currencies`
4. Price calculation changed to invert rates
5. Removed gram-to-ounce conversion (API returns oz directly)

### Testing

To test the API integration:

1. **Start the server**:
   ```bash
   npm run server
   ```

2. **Check logs**:
   - Look for "Prices updated successfully"
   - If you see "Using mock price data", check your API key

3. **Test the endpoint**:
   ```bash
   curl http://localhost:5000/api/prices/current
   ```

4. **Expected response**:
   ```json
   {
     "prices": [
       {
         "metal": "gold",
         "price": 1950.50,
         "changePercentage": 0.64,
         "timestamp": "2025-10-24T08:00:00.000Z"
       },
       // ... other metals
     ],
     "currency": "USD"
   }
   ```

### Fallback Behavior

If the API key is missing or invalid, the application will:
1. Log an error message
2. Use **mock data** for development (realistic random prices)
3. Continue functioning normally

This ensures the app works even without a valid API key during development.

### Historical Data

The historical data endpoint has also been updated:
- **Old**: `timeseries`
- **New**: `timeframe`

Parameters remain similar:
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `base`: Currency
- `currencies`: Metal symbols

### Migration Checklist

- [x] Update API base URL
- [x] Change parameter names
- [x] Update price calculation logic
- [x] Update `.env` and `.env.example`
- [x] Test with real API key
- [x] Verify mock data fallback
- [x] Update documentation
- [x] Test historical data endpoint

### Troubleshooting

#### Issue: "401 Unauthorized"
**Solution**: Check that your API key is correct in `.env`

#### Issue: "Using mock price data"
**Cause**: API key missing or API limit exceeded
**Solution**: 
1. Verify API key in `.env`
2. Check your API usage at https://metalpriceapi.com/dashboard
3. Mock data will work for development

#### Issue: Prices seem incorrect
**Solution**: Verify the currency parameter and rate inversion logic

### API Documentation

For complete API documentation, visit:
- https://metalpriceapi.com/documentation
- Example requests
- Rate limits
- Response formats
- Error codes

---

**Status**: ✅ Migration Complete  
**Date**: October 24, 2025  
**Version**: 1.0.0

The application is now using Metal Price API for all precious metals price data with automatic fallback to mock data during development.
