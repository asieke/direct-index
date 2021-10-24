const Alpaca = require("@alpacahq/alpaca-trade-api");
const pool = require("../db");

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY,
  secretKey: process.env.ALPACA_SECRET,
  paper: true,
  usePolygon: false,
});

alpaca.getAccount().then((account) => {
  let query = "INSERT INTO account_balances (balance) VALUES ($1)";
  pool.query(query, [account.equity]);
  pool.end();
});
