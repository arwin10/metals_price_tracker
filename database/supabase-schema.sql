-- Gold Price Tracker - Supabase Schema
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (Supabase Auth will handle authentication)
-- This table extends the auth.users table with additional profile data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  preferred_currency TEXT DEFAULT 'USD',
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read and update their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create metal_prices table
CREATE TABLE IF NOT EXISTS public.metal_prices (
  id BIGSERIAL PRIMARY KEY,
  metal_type TEXT NOT NULL,
  price_usd DECIMAL(12, 2) NOT NULL,
  price_eur DECIMAL(12, 2),
  price_gbp DECIMAL(12, 2),
  price_inr DECIMAL(12, 2),
  bid_price DECIMAL(12, 2),
  ask_price DECIMAL(12, 2),
  change_24h DECIMAL(10, 4),
  change_percentage DECIMAL(6, 2),
  high_24h DECIMAL(12, 2),
  low_24h DECIMAL(12, 2),
  source TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metal_type, timestamp)
);

-- Enable Row Level Security (public read access)
ALTER TABLE public.metal_prices ENABLE ROW LEVEL SECURITY;

-- Anyone can read metal prices
CREATE POLICY "Anyone can view metal prices" ON public.metal_prices
  FOR SELECT USING (true);

-- Only service role can insert/update prices (handled by backend)
CREATE POLICY "Service role can insert prices" ON public.metal_prices
  FOR INSERT WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_metal_prices_type_timestamp 
  ON public.metal_prices(metal_type, timestamp DESC);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Users can only access their own portfolios
CREATE POLICY "Users can view own portfolios" ON public.portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own portfolios" ON public.portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON public.portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON public.portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Create portfolio_holdings table
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id BIGSERIAL PRIMARY KEY,
  portfolio_id BIGINT REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  metal_type TEXT NOT NULL,
  quantity DECIMAL(12, 4) NOT NULL,
  unit TEXT DEFAULT 'oz',
  purchase_price DECIMAL(12, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Users can only access holdings in their own portfolios
CREATE POLICY "Users can view own holdings" ON public.portfolio_holdings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = portfolio_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own holdings" ON public.portfolio_holdings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = portfolio_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own holdings" ON public.portfolio_holdings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = portfolio_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own holdings" ON public.portfolio_holdings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = portfolio_holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Create price_alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  metal_type TEXT NOT NULL,
  target_price DECIMAL(12, 2) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own alerts
CREATE POLICY "Users can view own alerts" ON public.price_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts" ON public.price_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON public.price_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON public.price_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Create alert_history table
CREATE TABLE IF NOT EXISTS public.alert_history (
  id BIGSERIAL PRIMARY KEY,
  alert_id BIGINT REFERENCES public.price_alerts(id) ON DELETE CASCADE NOT NULL,
  triggered_price DECIMAL(12, 2) NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_sent BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- Users can only view history for their own alerts
CREATE POLICY "Users can view own alert history" ON public.alert_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.price_alerts
      WHERE price_alerts.id = alert_history.alert_id
      AND price_alerts.user_id = auth.uid()
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_portfolios
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_holdings
  BEFORE UPDATE ON public.portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_alerts
  BEFORE UPDATE ON public.price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample price data
INSERT INTO public.metal_prices (metal_type, price_usd, price_eur, price_gbp, price_inr, bid_price, ask_price, change_24h, change_percentage, high_24h, low_24h, source)
VALUES 
  ('gold', 1950.50, 1810.25, 1545.30, 162500.00, 1948.50, 1952.50, 12.50, 0.64, 1965.00, 1935.00, 'Initial Data'),
  ('silver', 24.30, 22.55, 19.25, 2025.00, 24.20, 24.40, 0.35, 1.46, 24.50, 23.95, 'Initial Data'),
  ('platinum', 950.75, 882.50, 753.80, 79200.00, 948.75, 952.75, -5.25, -0.55, 958.00, 945.00, 'Initial Data'),
  ('palladium', 1280.25, 1188.50, 1014.60, 106750.00, 1276.25, 1284.25, -15.75, -1.21, 1295.00, 1265.00, 'Initial Data')
ON CONFLICT (metal_type, timestamp) DO NOTHING;

-- Enable Realtime for metal_prices table (for live price updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.metal_prices;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Comments
COMMENT ON TABLE public.users IS 'User profiles extending Supabase Auth';
COMMENT ON TABLE public.metal_prices IS 'Historical precious metals price data';
COMMENT ON TABLE public.portfolios IS 'User portfolio containers';
COMMENT ON TABLE public.portfolio_holdings IS 'Individual holdings within portfolios';
COMMENT ON TABLE public.price_alerts IS 'User-configured price alerts';
COMMENT ON TABLE public.alert_history IS 'History of triggered price alerts';
