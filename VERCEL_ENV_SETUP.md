# Vercel Environment Variables Setup Guide

## Issue Resolved
✅ Fixed build error: "Missing Supabase environment variables"

The application now builds successfully even without environment variables set during build time, but **you must add them in Vercel for the app to work at runtime**.

---

## 🚨 CRITICAL: Add These Environment Variables in Vercel

### Step-by-Step Instructions

#### 1. Go to Your Vercel Dashboard
- Navigate to: https://vercel.com/dashboard
- Select your project: `metals_price_tracker`
- Click on **Settings** tab

#### 2. Add Environment Variables
Click **Environment Variables** in the left sidebar, then add these **3 required variables**:

### Required Variables

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
```

**How to get this:**
1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy the **Project URL**

---

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get this:**
1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy the **anon** **public** key (under Project API keys)

---

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get this:**
1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy the **service_role** **secret** key
   - **⚠️ IMPORTANT:** This is a secret key, keep it safe!

---

### Environment Selection

For each variable, select which environments to apply to:
- ✅ **Production** (required)
- ✅ **Preview** (recommended)
- ✅ **Development** (optional, for `vercel dev` local testing)

---

## 📸 Visual Guide

### Where to Find Supabase Keys:

1. **Supabase Dashboard** → Your Project
2. **Settings** (gear icon in sidebar)
3. **API** section
4. You'll see:
   ```
   Project URL: https://xxxxx.supabase.co
   
   Project API keys:
   - anon/public: eyJhbGci... (safe to use in browser)
   - service_role: eyJhbGci... (keep secret!)
   ```

### Where to Add in Vercel:

1. **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter variable name and value
5. Select environments (Production, Preview, Development)
6. Click **Save**

---

## ✅ Verification Checklist

After adding all 3 environment variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] All 3 are enabled for **Production** environment
- [ ] Redeploy your project (Vercel will auto-redeploy)

---

## 🔄 Trigger Redeployment

After adding environment variables:

### Method 1: Automatic (Recommended)
Vercel should automatically redeploy. Wait 2-3 minutes.

### Method 2: Manual Trigger
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋮** (three dots)
4. Select **Redeploy**

### Method 3: Git Push
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## 🧪 Test After Deployment

### 1. Test API Endpoints
```bash
# Replace with your Vercel URL
VERCEL_URL="https://your-app.vercel.app"

# Test prices API
curl "$VERCEL_URL/api/prices/current?currency=USD"

# Should return JSON with prices (not an error)
```

### 2. Test Frontend
Visit your Vercel URL: `https://your-app.vercel.app`

**Expected behavior:**
- ✅ Home page loads
- ✅ Prices display (may be empty if cron hasn't run yet)
- ✅ Login/Register pages work
- ✅ No "Server configuration error" messages

---

## 🐛 Troubleshooting

### Build Still Fails
**Solution:** The code changes should fix this. If it still fails:
1. Check that you committed and pushed the latest changes
2. Try clearing Vercel build cache:
   - Go to **Settings** → **General**
   - Scroll to **Build & Development Settings**
   - Click **Clear Build Cache**

### "Server configuration error" at Runtime
**Cause:** Environment variables not set correctly

**Solution:**
1. Verify all 3 variables are added in Vercel
2. Check variable names match exactly (case-sensitive)
3. Ensure they're enabled for Production
4. Redeploy

### Can't Find Supabase Keys
**Solution:**
1. Make sure you created a Supabase project
2. Check you're in the correct project
3. If you don't have a project, create one:
   - Go to https://supabase.com
   - Click **New Project**
   - Follow setup wizard

### API Returns Empty Data
**Cause:** Database tables don't exist or cron hasn't run

**Solution:**
1. Run the SQL schema in Supabase:
   - Copy content from `database/supabase-schema.sql`
   - Go to Supabase → SQL Editor
   - Paste and execute
2. Trigger initial price update:
   ```bash
   curl https://your-app.vercel.app/api/cron/update-prices
   ```

---

## 📝 What Changed in the Code

### Before (Caused Build Error):
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
```
❌ This threw an error during build time when variables weren't set.

### After (Build Success):
```typescript
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return placeholder for build time
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};
```
✅ Uses placeholder values during build, real values at runtime.

---

## 🎯 Summary

**Problem:** Build failed because environment variables weren't available during build

**Solution:** 
1. ✅ Code updated to use placeholders during build
2. ✅ Runtime validation added to API routes
3. ✅ You must add environment variables in Vercel Dashboard

**Next Steps:**
1. Add the 3 environment variables in Vercel
2. Redeploy (automatic or manual)
3. Test your deployment
4. Done! 🎉

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase API Keys Guide](https://supabase.com/docs/guides/api/api-keys)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**Need Help?** Check the main deployment guide: `VERCEL_DEPLOYMENT.md`
