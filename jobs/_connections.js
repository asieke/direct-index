const Alpaca = require("@alpacahq/alpaca-trade-api");
const pool = require("../db");
require("dotenv").config({ path: "../.env" });

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY,
  secretKey: process.env.ALPACA_SECRET,
  paper: true,
  usePolygon: false,
});

module.exports = {
  pool,
  alpaca,
};
