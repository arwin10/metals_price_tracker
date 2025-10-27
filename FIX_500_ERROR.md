# ✅ Fixed: 500 Internal Server Error

## Issue
Your API endpoint returns 500 error:
```
https://metals-price-tracker-u2ax.vercel.app/api/prices/current?currency=USD
```

## Root Cause
**Missing Supabase environment variables in Vercel**

The API is deployed and running, but it can't connect to your Supabase database because the credentials aren't configured.

---

## 🚨 IMMEDIATE FIX REQUIRED

### Step 1: Add Environment Variables in Vercel

**Go to:** https://vercel.com/dashboard

1. Click on your project: `metals-price-tracker-u2ax`
2. Go to **Settings** → **Environment Variables**
3. Add these **3 variables**:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Get from Supabase]
```

**How to get:**
- Go to https://app.supabase.com
- Select your project
- Click **Settings** → **API**
- Copy **Project URL**

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Get from Supabase]
```

**How to get:**
- Same page as above
- Copy **anon** **public** key (under "Project API keys")

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Get from Supabase]
```

**How to get:**
- Same page as above
- Copy **service_role** **secret** key
- ⚠️ Keep this secret!

### Step 2: Enable for Production

For each variable:
- ✅ Check **Production**
- ✅ Check **Preview** (optional)
- ✅ Check **Development** (optional)

### Step 3: Save and Redeploy

1. Click **Save** for each variable
2. Vercel will **automatically redeploy** (takes 2-3 minutes)
3. Wait for deployment to complete

---

## 🧪 Test After Deployment

### New Diagnostic Endpoint

I've added a health check endpoint to verify configuration:

```bash
curl https://metals-price-tracker-u2ax.vercel.app/api/health
```

**Expected Response (if configured correctly):**
```json
{
  "status": "OK",
  "message": "All environment variables are configured",
  "diagnostics": {
    "supabase": {
      "hasUrl": true,
      "hasAnonKey": true,
      "hasServiceKey": true
    }
  }
}
```

**If misconfigured:**
```json
{
  "status": "CONFIGURATION_ERROR",
  "message": "Missing required environment variables",
  "nextSteps": [
    "Go to Vercel Dashboard...",
    "Add: NEXT_PUBLIC_SUPABASE_URL..."
  ]
}
```

### Test Prices API

After adding variables and redeployment:

```bash
curl https://metals-price-tracker-u2ax.vercel.app/api/prices/current?currency=USD
```

**Expected Response:**
```json
{
  "prices": [],
  "currency": "USD"
}
```

**Note:** Prices will be empty until you populate the database!

---

## 📊 Populate Price Data

Once environment variables are set, trigger the price update:

```bash
curl https://metals-price-tracker-u2ax.vercel.app/api/cron/update-prices
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Prices updated successfully",
  "results": [
    {"metal": "gold", "status": "success", "price": 4100.90},
    {"metal": "silver", "status": "success", "price": 48.63},
    ...
  ]
}
```

**Then test prices again:**
```bash
curl https://metals-price-tracker-u2ax.vercel.app/api/prices/current?currency=USD
```

Now you should see actual price data!

---

## ✅ Verification Checklist

- [ ] Added all 3 environment variables in Vercel
- [ ] Variables enabled for Production
- [ ] Waited for automatic redeployment (2-3 mins)
- [ ] Tested `/api/health` - shows "OK"
- [ ] Triggered `/api/cron/update-prices` - success
- [ ] Tested `/api/prices/current` - returns price data
- [ ] Visited app in browser - prices display

---

## 🗄️ Ensure Database Tables Exist

If you still get errors after adding env vars, check your Supabase database:

### Step 1: Verify Tables
1. Go to https://app.supabase.com
2. Select your project
3. Click **Table Editor** (left sidebar)
4. Verify these tables exist:
   - `metal_prices`
   - `users`
   - `price_alerts`
   - `portfolios`
   - `portfolio_holdings`
   - `alert_history`

### Step 2: Create Tables (if missing)
1. Click **SQL Editor**
2. Open `database/supabase-schema.sql` from your project
3. Copy entire content
4. Paste in SQL Editor
5. Click **Run**

---

## 🔍 Enhanced Error Messages

I've updated the API to provide better error messages:

**Before:**
```json
{
  "error": "Failed to fetch prices"
}
```

**After (if env vars missing):**
```json
{
  "error": "Server configuration error",
  "message": "Supabase environment variables are not configured...",
  "debug": {
    "hasSupabaseUrl": false,
    "hasSupabaseKey": false
  }
}
```

This helps you diagnose the exact problem!

---

## 🚀 What Changed

### New Files:
1. ✅ `app/api/health/route.ts` - Diagnostic endpoint
2. ✅ Updated `app/api/prices/current/route.ts` - Better error handling

### Improvements:
- ✅ Environment variable validation
- ✅ Detailed error messages
- ✅ Debug information in responses
- ✅ Health check endpoint

---

## 📋 Quick Action Plan

1. **Right Now:**
   - Go to Vercel Dashboard
   - Add 3 environment variables
   - Wait for redeploy

2. **After Redeploy (2-3 mins):**
   - Test `/api/health`
   - Should show "OK"

3. **Populate Data:**
   - Run `/api/cron/update-prices`
   - Check for success message

4. **Verify:**
   - Test `/api/prices/current`
   - Should return price data
   - Visit your app URL
   - Prices should display!

---

## 🆘 Still Getting 500 Error?

### After Adding Environment Variables:

**Check deployment status:**
1. Vercel Dashboard → Deployments
2. Latest deployment should be "Ready"
3. Click on it → Check "Runtime Logs"
4. Look for any error messages

**Test the health endpoint:**
```bash
curl https://metals-price-tracker-u2ax.vercel.app/api/health
```

**Share the response with me** and I'll help debug further!

---

## 📖 Summary

**Problem:** API returns 500 error
**Cause:** Missing Supabase environment variables
**Solution:** Add 3 variables in Vercel Dashboard
**Time:** 5 minutes to fix
**Result:** APIs will work perfectly!

---

**Add those environment variables now and your APIs will start working immediately!** 🎉
