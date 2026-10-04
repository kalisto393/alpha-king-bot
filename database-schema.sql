-- Create tables for Alpha King BOT

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),
  account_name VARCHAR(255),
  account_type VARCHAR(50),
  deriv_token_hash VARCHAR(255) NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  is_bot_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_config (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  max_risk_per_trade DECIMAL(5, 2) DEFAULT 2.0,
  max_daily_loss DECIMAL(10, 2),
  max_positions INTEGER DEFAULT 5,
  trade_lot_size DECIMAL(10, 4),
  stop_loss_distance DECIMAL(10, 4),
  take_profit_ratio DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  contract_id VARCHAR(100) UNIQUE,
  symbol VARCHAR(50),
  action VARCHAR(10), -- BUY or SELL
  amount DECIMAL(10, 2),
  entry_price DECIMAL(10, 6),
  stop_loss DECIMAL(10, 6),
  take_profit DECIMAL(10, 6),
  status VARCHAR(50), -- open, closed, cancelled
  result VARCHAR(50), -- win, loss, pending
  profit_loss DECIMAL(10, 2),
  executed_at TIMESTAMP,
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS signals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  symbol VARCHAR(50),
  signal VARCHAR(10), -- BUY or SELL
  confidence INTEGER,
  entry DECIMAL(10, 6),
  take_profit DECIMAL(10, 6),
  stop_loss DECIMAL(10, 6),
  timeframe VARCHAR(10),
  result VARCHAR(50), -- pending, win, loss
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_balance_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  balance DECIMAL(15, 2),
  currency VARCHAR(10),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bot_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  action VARCHAR(100),
  status VARCHAR(50),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_signals_user_id ON signals(user_id);
CREATE INDEX idx_signals_created ON signals(created_at);
CREATE INDEX idx_account_history_user ON account_balance_history(user_id);
CREATE INDEX idx_bot_logs_user ON bot_logs(user_id);

-- Grants (if using separate app user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
