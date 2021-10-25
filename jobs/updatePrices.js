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

    await pool.query(`UPDATE stocks SET spread = null`);
    await pool.query(`UPDATE stocks SET spread = 100*(best_ask - best_bid)/best_bid
      WHERE best_bid > 0 AND best_ask > 0`);
    await pool.query(`UPDATE stocks SET market_cap = shares * last_trade`);

    await markDuplicateSymbolsInDB();

    pool.end();
  } catch (error) {
    console.log(error);
  }
};

updatePrices();

const markDuplicateSymbolsInDB = async () => {
  let result = await pool.query(`SELECT
  name, array_agg(symbol) as symbols, array_agg(market_cap) as market_caps,
  array_agg(fractionable) as fractionable, array_agg(last_trade) as last_trades
  FROM stocks GROUP BY name HAVING count(1)>1;`);

  await pool.query(`UPDATE stocks SET duplicate = null`);

  let dupes = await getArrayOfDuplicateSymbols(result.rows);

  for (let i = 0; i < dupes.length; i++) {
    let sql = `update stocks set duplicate = true where symbol = $1`;
    await pool.query(sql, [dupes[i]]);
  }
};

//Iterates through all duplicates companies and returns an array of duplicate symbols to avoid
const getArrayOfDuplicateSymbols = (arr) => {
  let out = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].fractionable[0] === arr[i].fractionable[1]) {
      if (arr[i].market_caps[0] < arr[i].market_caps[1]) {
        out.push(arr[i].symbols[0]);
      } else {
        out.push(arr[i].symbols[1]);
      }
    } else {
      if (arr[i].fractionable[0] === true) {
        out.push(arr[i].symbols[1]);
      } else {
        out.push(arr[i].symbols[0]);
      }
    }
  }
  return out;
};
