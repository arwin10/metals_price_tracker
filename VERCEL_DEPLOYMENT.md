# Vercel Deployment Guide

## Overview
This guide explains how to deploy the Metals Price Tracker application to Vercel with full Supabase integration.

## Architecture Changes

### Migration from Express to Next.js API Routes
The application has been migrated from a standalone Express backend to Next.js API routes for seamless Vercel deployment:

- **Old**: Express server running on port 5000 (`server/` directory)
- **New**: Next.js API routes (`app/api/` directory)

### API Routes Structure

```
app/api/
├── auth/
│   ├── login/route.ts          - POST /api/auth/login
│   └── register/route.ts       - POST /api/auth/register
├── prices/
│   ├── current/route.ts        - GET /api/prices/current?currency=USD
│   └── history/[metal]/route.ts - GET /api/prices/history/{metal}
└── cron/
    └── update-prices/route.ts  - GET /api/cron/update-prices (Vercel Cron)
```

## Prerequisites

1. **Supabase Project**
   - Create a Supabase project at https://supabase.com
   - Run the SQL schema from `database/supabase-schema.sql`
   - Note your project URL and service role key

2. **Vercel Account**
   - Sign up at https://vercel.com
   - Install Vercel CLI: `npm i -g vercel`

## Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Cron Job Security
CRON_SECRET=your-random-secret-string
```

### How to Get Supabase Keys

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - Add all required environment variables in the Vercel dashboard
   - Deploy!

### Method 2: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CRON_SECRET
```

## Vercel Cron Configuration

The `vercel.json` file configures automatic price updates:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-prices",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes to fetch latest metal prices from Gold API.

### Cron Job Security (Optional)

To secure your cron endpoint:

1. Generate a random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Add to Vercel environment variables:
   ```
   CRON_SECRET=your-generated-secret
   ```

The cron endpoint will verify the secret in the Authorization header.

## Post-Deployment

### 1. Verify Deployment

Visit your Vercel URL:
```
https://your-app.vercel.app
```

### 2. Test API Endpoints

```bash
# Test current prices
curl https://your-app.vercel.app/api/prices/current?currency=USD

# Test historical data
curl https://your-app.vercel.app/api/prices/history/gold?startDate=2025-01-01&endDate=2025-01-31
```

### 3. Trigger Manual Price Update

```bash
# If CRON_SECRET is set
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/update-prices

# If no CRON_SECRET
curl https://your-app.vercel.app/api/cron/update-prices
```

### 4. Monitor Cron Jobs

- Go to Vercel Dashboard → Your Project → Cron
- View execution logs and history

## Database Schema

Ensure your Supabase database has the required tables:

```sql
-- Run database/supabase-schema.sql in Supabase SQL Editor
```

### Required Tables:
- `users` - User profiles
- `metal_prices` - Historical price data
- `price_alerts` - User price alerts
- `alert_history` - Alert triggers
- `portfolios` - User portfolios
- `portfolio_holdings` - Portfolio items

## Troubleshooting

### API Routes Not Working

1. **Check Supabase Connection**
   ```bash
   # Verify environment variables are set
   vercel env ls
   ```

2. **Check Logs**
   ```bash
   vercel logs
   ```

3. **Test Locally**
   ```bash
   # Create .env.local with your variables
   npm run dev
   ```

### Cron Job Not Running

1. Verify `vercel.json` is committed
2. Check Vercel Dashboard → Cron tab
3. Ensure your Vercel plan supports cron jobs (Hobby tier has limits)

### Database Errors

1. Verify Supabase tables exist
2. Check Row Level Security (RLS) policies
3. Verify service role key permissions

## Migration from Express Backend

The standalone Express server (`npm run server`) is no longer needed in production:

- **Development**: You can still run both servers if needed
  - Frontend: `npm run dev` (port 3001)
  - Backend: `npm run server` (port 5000)
  
- **Production**: Only Next.js runs on Vercel
  - All API routes are serverless functions
  - No need for separate backend deployment

## Performance Optimization

### Caching

API routes use `force-dynamic` to ensure fresh data:

```typescript
export const dynamic = 'force-dynamic';
```

### Function Timeout

Cron job has extended timeout:

```typescript
export const maxDuration = 60; // 60 seconds
```

## Cost Optimization

- **Vercel Hobby Plan**: Free tier with limitations
  - 100 GB bandwidth
  - 100 hours function execution
  - Cron jobs limited

- **Supabase Free Plan**:
  - 500 MB database
  - 2 GB bandwidth
  - 50,000 monthly active users

## Next Steps

1. Set up custom domain in Vercel
2. Configure Supabase email templates
3. Set up monitoring and alerts
4. Implement rate limiting for API routes
5. Add API response caching where appropriate

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
