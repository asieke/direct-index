--create the database
--heroku pg:psql postgresql-regular-68990 --app direct-index
CREATE DATABASE direct_index;

--\c into direct_index
CREATE TABLE stocks(
  stock_id SERIAL PRIMARY KEY,
  ticker VARCHAR(255)
);

CREATE TABLE account_balances(
  account_balance_id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  balance float
);
