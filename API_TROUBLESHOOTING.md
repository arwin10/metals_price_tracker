# API Not Working - Troubleshooting Guide

## Issue Detected
Your Vercel URL requires authentication, which indicates this is a **preview deployment** rather than a production deployment.

## 🚨 Solution: Deploy to Production

### Step 1: Check Your Deployment Type

The URL you're using appears to be a **preview/development deployment**:
```
https://metals-price-tracker-u2ax-96qq9li20-arwin10s-projects.vercel.app
```

This requires Vercel authentication to access.

### Step 2: Get Your Production URL

#### Option A: Find Production URL in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your project: `metals_price_tracker`
3. Look for the **Production** deployment (has a green badge)
4. Click on it to get the production URL
5. It should look like: `https://metals-price-tracker.vercel.app` (without the long hash)

#### Option B: Deploy to Production

If you don't have a production deployment yet:

1. **Go to Vercel Dashboard** → Your Project
2. Click **Deployments** tab
3. Find the latest successful deployment
4. Click **⋮** (three dots) → **Promote to Production**

OR

Push to your main branch:
```bash
git checkout main
git pull origin main
git merge your-branch
git push origin main
```

---

## ✅ Verify Environment Variables Are Set

This is **CRITICAL** - your APIs won't work without these!

### Check in Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Verify these 3 variables exist:

   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

3. Make sure they're enabled for **Production** environment

### If Missing: Add Them Now

**Where to get Supabase keys:**

1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

**Add to Vercel:**

1. Vercel Dashboard → Settings → Environment Variables
2. Click **Add New** for each variable
3. Select **Production** checkbox
4. Click **Save**

After adding variables, Vercel will **auto-redeploy**.

---

## 🧪 Test Your Production Deployment

Once you have the correct production URL:

### Test 1: Home Page
```bash
curl https://your-production-url.vercel.app
```

**Expected:** HTML content (not auth page)

### Test 2: Prices API
```bash
curl https://your-production-url.vercel.app/api/prices/current
```

**Expected Response:**
```json
{
  "prices": [],
  "currency": "USD"
}
```

**Note:** Prices array might be empty initially. That's OK!

### Test 3: Trigger Price Update
```bash
curl https://your-production-url.vercel.app/api/cron/update-prices
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Prices updated successfully",
  "results": [...]
}
```

### Test 4: Check Prices Again
```bash
curl https://your-production-url.vercel.app/api/prices/current
```

**Expected:** Should now have price data!

---

## 🐛 Common Issues & Fixes

### Issue 1: "Server configuration error"

**Cause:** Environment variables not set

**Fix:**
1. Add the 3 Supabase env vars in Vercel
2. Wait for auto-redeploy (2-3 mins)
3. Test again

### Issue 2: Empty prices array `{"prices": []}`

**Cause:** Cron hasn't run yet OR database tables don't exist

**Fix A - Trigger manual update:**
```bash
curl https://your-url.vercel.app/api/cron/update-prices
```

**Fix B - Check Supabase tables:**
1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Verify these tables exist:
   - `users`
   - `metal_prices`
   - `price_alerts`
   - `portfolios`
   - `portfolio_holdings`

**If tables don't exist:**
1. Go to Supabase → **SQL Editor**
2. Copy content from `database/supabase-schema.sql`
3. Paste and click **Run**

### Issue 3: Authentication Required

**Cause:** Using preview deployment URL

**Fix:** Use production URL instead (see Step 2 above)

### Issue 4: 404 Not Found on API routes

**Cause:** API routes not deployed

**Fix:**
1. Check Vercel build logs
2. Ensure build completed successfully
3. Redeploy if needed

---

## 📋 Quick Checklist

Before testing APIs, verify:

- [ ] Using **production** URL (not preview URL with hash)
- [ ] All 3 **environment variables** added in Vercel
- [ ] Variables enabled for **Production** environment
- [ ] Latest deployment shows **"Ready"** status
- [ ] Build completed without errors
- [ ] Supabase database tables exist

---

## 🔍 Check Deployment Status

### In Vercel Dashboard:

1. Go to **Deployments** tab
2. Look for **Production** deployment (green badge)
3. Click on it
4. Check:
   - ✅ Build Status: **Ready**
   - ✅ Runtime Logs: No errors
   - ✅ Environment Variables: All set

### Check Build Logs:

1. Click on your production deployment
2. Click **Build Logs**
3. Look for:
   ```
   ✓ Compiled successfully
   ✓ Generating static pages
   ```
4. Should **NOT** see:
   ```
   Error: Missing Supabase environment variables
   ```

---

## 🌐 Access Your App

### Production URL Format:

Vercel gives you a URL in this format:
- `https://your-project-name.vercel.app`
- OR custom domain if configured

### Not This (Preview URL):
- `https://your-project-name-hash123-username.vercel.app` ❌

---

## 📞 Need More Help?

### Check These Files:
- `VERCEL_ENV_SETUP.md` - Environment variables setup
- `BUILD_ERROR_FIXED.md` - Build issues
- `VERCEL_DEPLOYMENT.md` - Full deployment guide

### Vercel Logs:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs https://your-url.vercel.app
```

---

## ✅ Success Criteria

Your APIs are working when:

1. ✅ Production URL loads without authentication
2. ✅ `/api/prices/current` returns JSON (not error)
3. ✅ `/api/cron/update-prices` successfully fetches prices
4. ✅ Frontend displays price cards
5. ✅ Login/Register pages work

---

## 🎯 Next Steps

1. **Get production URL** from Vercel Dashboard
2. **Verify environment variables** are set
3. **Test API endpoints** using production URL
4. **Trigger price update** manually
5. **Verify data** appears in app

---

## 📝 Example: Working Setup

**Production URL:**
```
https://metals-price-tracker.vercel.app
```

**Test Commands:**
```bash
# Test home page
curl https://metals-price-tracker.vercel.app

# Test API
curl https://metals-price-tracker.vercel.app/api/prices/current

# Trigger update
curl https://metals-price-tracker.vercel.app/api/cron/update-prices
```

**Expected Results:**
- Home: HTML content ✅
- Prices API: JSON with price data ✅
- Cron: Success message ✅

---

**Once you have your production URL, test it and let me know what response you get!** 🚀
