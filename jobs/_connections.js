const Alpaca = require("@alpacahq/alpaca-trade-api");
const pool = require("../db");
require("dotenv").config({ path: "../.env" });

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY,
  secretKey: process.env.ALPACA_SECRET,
  paper: true,
  usePolygon: false,
});

const alpacaOptions = {
  contentType: "application/json",
  headers: {
    "APCA-API-KEY-ID": process.env.ALPACA_KEY,
    "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET,
  },
};

module.exports = {
  pool,
  alpaca,
  alpacaOptions,
};
