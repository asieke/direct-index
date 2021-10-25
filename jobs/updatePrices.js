/**************************************
 * jobs/updateAssets.js
 * pull prices from Alpaca API
 * insert into "stocks" table
 * RUNS every 10min
 ***************************************/

const { pool, alpacaOptions } = require("./_connections.js");
const axios = require("axios");

const updatePrices = async () => {
  try {
    let result = await pool.query("select symbol from stocks");
    let symbols = result.rows.map((x) => x.symbol);

    for (let i = 0; i < symbols.length; i += 250) {
      console.log("pulling prices: " + i + "-" + (i + 250));
      let url =
        "https://data.alpaca.markets/v2/stocks/snapshots?symbols=" +
        symbols.slice(i, i + 250).join(",");

      const response = await axios.get(url, alpacaOptions);
      const data = response.data;

      const values = [];
      for (k in data) {
        values.push([
          k,
          data[k].latestTrade.p,
          data[k].latestQuote.bp,
          data[k].latestQuote.ap,
        ]);
      }

      for (let j = 0; j < values.length; j++) {
        let sql = `UPDATE stocks SET
        last_trade = $2, best_bid = $3, best_ask = $4 where symbol = $1;`;
        await pool.query(sql, values[j]);
      }
    }

    await pool.query(
      `UPDATE stocks SET market_cap = shares * last_trade, spread = 100*(best_ask - best_bid)/best_bid`
    );
    pool.end();
  } catch (error) {
    console.log(error);
  }
};

updatePrices();
