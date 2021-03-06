--create the database
--heroku pg:psql postgresql-regular-68990 --app direct-index
CREATE DATABASE direct_index;

CREATE TABLE account_balances(
  account_balance_id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  balance float
);

CREATE TABLE orders(
  id UUID,
  client_order_id VARCHAR(255),
  created_at VARCHAR(255),
  submitted_at VARCHAR(255),
  filled_at VARCHAR(255),
  asset_id VARCHAR(255),
  symbol VARCHAR(16),
  notional FLOAT,
  qty FLOAT,
  filled_qty FLOAT,
  filled_avg_price FLOAT,
  type VARCHAR(16),
  side VARCHAR(16)
);

CREATE TABLE stocks(
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(16) UNIQUE,
  name VARCHAR(255),
  sector VARCHAR(255),
  industry VARCHAR(255),
  coutry VARCHAR(255),
  status VARCHAR(255),
  tradable BOOLEAN,
  fractionable BOOLEAN,
  duplicate BOOLEAN,
  shares FLOAT,
  last_trade FLOAT,
  market_cap FLOAT,
  best_bid FLOAT,
  best_ask FLOAT,
  spread FLOAT,
  last_updated VARCHAR(255)
);



