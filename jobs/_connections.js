const Alpaca = require("@alpacahq/alpaca-trade-api");
const pool = require("../db");
require("dotenv").config({ path: "../.env" });

const MODE = "paper"; //paper or live

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY,
  secretKey: process.env.ALPACA_SECRET,
  paper: true,
  usePolygon: false,
});

const alpacaOptions = {
  contentType: "application/json",
  headers: {
    "APCA-API-KEY-ID":
      MODE === "paper" ? process.env.ALPACA_KEY : process.env.ALPACA_KEY_LIVE,
    "APCA-API-SECRET-KEY":
      MODE === "paper"
        ? process.env.ALPACA_SECRET
        : process.env.ALPACA_SECRET_LIVE,
  },
};

const alpacaUrls = {
  stock:
    MODE === "paper"
      ? "https://paper-api.alpaca.markets"
      : "https://api.alpaca.markets",
  data: "https://data.alpaca.markets",
};

module.exports = {
  pool,
  alpaca,
  alpacaOptions,
  alpacaUrls,
};
