-- Gold Price Tracker Database Initialization Script
-- This script will be auto-executed by the application on first run
-- But you can also run it manually if needed

-- Create database (run this as postgres superuser)
-- CREATE DATABASE gold_tracker;
-- \c gold_tracker;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create metal_prices table
CREATE TABLE IF NOT EXISTS metal_prices (
  id SERIAL PRIMARY KEY,
  metal_type VARCHAR(50) NOT NULL,
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
  source VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(metal_type, timestamp)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_metal_prices_type_timestamp 
ON metal_prices(metal_type, timestamp DESC);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create portfolio_holdings table
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
  metal_type VARCHAR(50) NOT NULL,
  quantity DECIMAL(12, 4) NOT NULL,
  unit VARCHAR(20) DEFAULT 'oz',
  purchase_price DECIMAL(12, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create price_alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  metal_type VARCHAR(50) NOT NULL,
  target_price DECIMAL(12, 2) NOT NULL,
  condition VARCHAR(10) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create alert_history table
CREATE TABLE IF NOT EXISTS alert_history (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER REFERENCES price_alerts(id) ON DELETE CASCADE,
  triggered_price DECIMAL(12, 2) NOT NULL,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notification_sent BOOLEAN DEFAULT false
);

-- Insert sample price data (optional)
INSERT INTO metal_prices (metal_type, price_usd, price_eur, price_gbp, price_inr, bid_price, ask_price, change_24h, change_percentage, high_24h, low_24h, source)
VALUES 
  ('gold', 1950.50, 1810.25, 1545.30, 162500.00, 1948.50, 1952.50, 12.50, 0.64, 1965.00, 1935.00, 'Initial Data'),
  ('silver', 24.30, 22.55, 19.25, 2025.00, 24.20, 24.40, 0.35, 1.46, 24.50, 23.95, 'Initial Data'),
  ('platinum', 950.75, 882.50, 753.80, 79200.00, 948.75, 952.75, -5.25, -0.55, 958.00, 945.00, 'Initial Data'),
  ('palladium', 1280.25, 1188.50, 1014.60, 106750.00, 1276.25, 1284.25, -15.75, -1.21, 1295.00, 1265.00, 'Initial Data')
ON CONFLICT (metal_type, timestamp) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at BEFORE UPDATE ON portfolio_holdings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

COMMENT ON TABLE users IS 'User accounts and authentication';
COMMENT ON TABLE metal_prices IS 'Historical precious metals price data';
COMMENT ON TABLE portfolios IS 'User portfolio containers';
COMMENT ON TABLE portfolio_holdings IS 'Individual holdings within portfolios';
COMMENT ON TABLE price_alerts IS 'User-configured price alerts';
COMMENT ON TABLE alert_history IS 'History of triggered price alerts';
