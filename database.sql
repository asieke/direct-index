--create the database
CREATE DATABASE direct_index;

--\c into direct_index
CREATE TABLE stocks(
  stock_id SERIAL PRIMARY KEY,
  ticker VARCHAR(255)
);
