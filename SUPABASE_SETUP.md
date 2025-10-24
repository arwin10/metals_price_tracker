# Supabase Integration Guide

This guide will help you set up Supabase for the Gold Price Tracker application.

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: gold-price-tracker
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

### 2. Get Your API Keys

Once your project is created:

1. Go to **Project Settings** → **API**
2. Copy these values:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (click "Reveal") → This is your `SUPABASE_SERVICE_ROLE_KEY`

### 3. Update Environment Variables

Update your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Metals API (optional - uses mock data if not provided)
METALS_API_KEY=your-metals-api-key

# API Configuration
API_PORT=5000
FRONTEND_URL=http://localhost:3000
PRICE_UPDATE_INTERVAL=5
```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database/supabase-schema.sql`
4. Paste into the SQL editor
5. Click **Run**

This will create:
- All database tables
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for auto-updating timestamps
- Sample price data

### 5. Install Dependencies

```bash
# Install Supabase client libraries
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react

# Or use the setup script
.\setup.ps1
```

## 📊 What Changed from PostgreSQL

### Authentication
- **Before**: Custom JWT with bcrypt
- **Now**: Supabase Auth with built-in user management
- **Benefits**:
  - Email verification handled automatically
  - Password reset flows built-in
  - Social login ready (Google, GitHub, etc.)
  - MFA support

### Database
- **Before**: Self-hosted PostgreSQL with pg client
- **Now**: Supabase PostgreSQL with REST API
- **Benefits**:
  - Automatic backups
  - Point-in-time recovery
  - Built-in connection pooling
  - No server management

### Real-time Features (New!)
- **Price Updates**: Automatic real-time subscriptions
- **Live Alerts**: Instant notifications
- **Collaborative Features**: Multiple users see updates instantly

### File Storage (Available)
- Can add file uploads for portfolio documents
- Built-in CDN for images
- Automatic image transformations

## 🔐 Row Level Security (RLS)

Supabase uses RLS to protect your data:

### Users Table
- Users can only view and edit their own profile
- Automatic user creation on signup

### Portfolios & Holdings
- Users can only access their own portfolios
- Foreign key relationships maintain data integrity

### Price Alerts
- Users can only manage their own alerts
- Alert history is user-scoped

### Metal Prices
- Everyone can read prices (public data)
- Only backend (service role) can insert/update

## 📡 Real-Time Subscriptions

Enable live price updates in your frontend:

```typescript
import { supabase } from '@/lib/supabase';

// Subscribe to price updates
const subscription = supabase
  .channel('price-updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'metal_prices'
    },
    (payload) => {
      console.log('New price:', payload.new);
      // Update your UI here
    }
  )
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
};
```

## 🔧 API Endpoints

### Authentication

#### Register
```typescript
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response: {
  "message": "User registered successfully...",
  "user": { ... },
  "session": {
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

#### Login
```typescript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "message": "Login successful",
  "user": { ... },
  "session": { ... }
}
```

#### Logout
```typescript
POST /api/auth/logout
Headers: { Authorization: "Bearer <access_token>" }
```

#### Refresh Token
```typescript
POST /api/auth/refresh
{
  "refresh_token": "..."
}
```

### Using Tokens

Store the `access_token` from the session:

```typescript
// Frontend
localStorage.setItem('sb-access-token', session.access_token);
localStorage.setItem('sb-refresh-token', session.refresh_token);

// API calls
const token = localStorage.getItem('sb-access-token');
axios.get('/api/portfolio', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🎨 Frontend Integration

### Create Supabase Context (Optional)

```typescript
// contexts/SupabaseContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, Session } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SupabaseContext = createContext({ supabase, session: null as Session | null });

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => useContext(SupabaseContext);
```

## 📱 Additional Supabase Features

### 1. Email Templates

Customize email templates in **Authentication** → **Email Templates**:
- Confirmation email
- Password reset
- Magic link

### 2. Social Login

Enable in **Authentication** → **Providers**:
```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google'
});
```

### 3. File Storage

Create a bucket for portfolio documents:

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('portfolio-docs')
  .upload('user/document.pdf', file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('portfolio-docs')
  .getPublicUrl('user/document.pdf');
```

### 4. Database Functions

Create custom functions in SQL Editor:

```sql
CREATE OR REPLACE FUNCTION get_portfolio_value(portfolio_id BIGINT)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL;
BEGIN
  SELECT SUM(quantity * (
    SELECT price_usd FROM metal_prices 
    WHERE metal_type = portfolio_holdings.metal_type 
    ORDER BY timestamp DESC LIMIT 1
  ))
  INTO total
  FROM portfolio_holdings
  WHERE portfolio_holdings.portfolio_id = $1;
  
  RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql;
```

## 🔍 Monitoring & Debugging

### 1. Logs

View logs in **Database** → **Logs**:
- API logs
- Database logs
- Auth logs

### 2. Table Editor

Browse and edit data in **Table Editor**

### 3. SQL Queries

Test queries in **SQL Editor** before implementing in code

## 🚀 Deployment

### Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Edge Functions (Optional)

Deploy serverless functions to Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize
supabase init

# Create edge function
supabase functions new update-prices

# Deploy
supabase functions deploy update-prices
```

## 💡 Best Practices

### 1. Never Expose Service Role Key
- Use only in backend/server code
- Never send to frontend
- Store in environment variables

### 2. Use RLS Policies
- Always enable RLS on tables
- Test policies thoroughly
- Use service role to bypass RLS when needed

### 3. Optimize Queries
- Use indexes for frequently queried columns
- Limit results with `.limit()`
- Select only needed columns

### 4. Handle Errors Gracefully
```typescript
const { data, error } = await supabase
  .from('portfolios')
  .select('*');

if (error) {
  console.error('Supabase error:', error.message);
  // Handle error appropriately
}
```

### 5. Use TypeScript Types
The generated types in `lib/database.types.ts` provide full type safety

## 🐛 Troubleshooting

### Connection Issues
- Check your Supabase URL and keys
- Ensure project is not paused (free tier pauses after inactivity)
- Check network/firewall settings

### RLS Errors
- Ensure user is authenticated
- Check RLS policies match your use case
- Use service role key for admin operations

### Slow Queries
- Add indexes to frequently queried columns
- Use `.limit()` and pagination
- Check query performance in SQL Editor

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

---

**🎉 You're all set!** Your Gold Price Tracker now uses Supabase for authentication, database, and real-time features!
