# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Create Supabase project at https://supabase.com
- [ ] Run SQL schema from `database/supabase-schema.sql`
- [ ] Copy Project URL
- [ ] Copy `anon` public key
- [ ] Copy `service_role` secret key
- [ ] Verify tables are created successfully

### 2. Environment Variables
Create `.env.local` for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Test Locally
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test in browser
open http://localhost:3000
```

### 4. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)
1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Import to Vercel:
   - Go to https://vercel.com/new
   - Select your repository
   - Add environment variables
   - Deploy!

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 5. Post-Deployment Verification

#### Test API Endpoints
```bash
# Replace with your Vercel URL
VERCEL_URL="https://your-app.vercel.app"

# Test prices API
curl "$VERCEL_URL/api/prices/current?currency=USD"

# Test cron job
curl "$VERCEL_URL/api/cron/update-prices"

# Test authentication
curl -X POST "$VERCEL_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

#### Check Vercel Dashboard
- [ ] Deployment successful
- [ ] Functions deployed correctly
- [ ] Cron job scheduled (Vercel Dashboard → Cron)
- [ ] No errors in logs

#### Check Supabase Dashboard
- [ ] Tables populated with price data
- [ ] User registration working
- [ ] No authentication errors

### 6. Initial Price Data Population

After deployment, trigger initial price update:
```bash
curl https://your-app.vercel.app/api/cron/update-prices
```

Wait a few seconds, then verify:
```bash
curl https://your-app.vercel.app/api/prices/current
```

You should see price data for gold, silver, platinum, and palladium.

## 🎯 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key | `eyJhbGciOiJIUzI1...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key | `eyJhbGciOiJIUzI1...` |
| `CRON_SECRET` | ⚠️ Recommended | Secret for cron endpoint security | `random-secret-string` |

## 🔧 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

### API Routes Return 500
- Check Vercel logs: `vercel logs`
- Verify environment variables are set
- Check Supabase connection

### No Price Data
- Manually trigger cron: `curl https://your-app.vercel.app/api/cron/update-prices`
- Check Vercel function logs
- Verify Gold API is accessible

### Authentication Not Working
- Verify Supabase auth is enabled
- Check `users` table exists
- Verify environment variables

## 📊 Monitoring

### Vercel Analytics
Enable in Vercel Dashboard → Analytics

### Supabase Logs
View in Supabase Dashboard → Logs

### Custom Monitoring
Set up alerts for:
- Failed cron executions
- API errors
- Database connection issues

## 🚀 Next Steps

1. **Custom Domain**: Add in Vercel Dashboard → Domains
2. **Email Setup**: Configure Supabase email templates
3. **Rate Limiting**: Implement API rate limiting
4. **Caching**: Add response caching for better performance
5. **Monitoring**: Set up error tracking (Sentry, etc.)

## 📝 Notes

- Cron jobs run every 5 minutes on Vercel
- Free tier has execution limits
- Database cleanup recommended after 30 days
- Monitor function execution times

## ✨ Success Criteria

✅ Build completes without errors
✅ All API routes are accessible
✅ Cron job runs successfully
✅ Prices update every 5 minutes
✅ User registration/login works
✅ Frontend displays live data
