const Alpaca = require("@alpacahq/alpaca-trade-api");
const pool = require("../db");

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY,
  secretKey: process.env.ALPACA_SECRET,
  paper: true,
  usePolygon: false,
});

alpaca.getAccount().then((account) => {
  console.log("Current Account:", account);
});

(function () {
  pool.query("INSERT INTO stocks (ticker) VALUES ('FB')");
  return;
})();
