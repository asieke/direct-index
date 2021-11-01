/**************************************
 * jobs/updateAssets.js
 * pull prices from Alpaca API
 * insert into "stocks" table
 * RUNS every 10min
 ***************************************/

const { pool, alpacaOptions, alpacaUrls } = require("./_connections.js");
const axios = require("axios");

const main = async () => {
  try {
    let symbols = await getAllSymbols();
    await updatePricesFromAlpaca(symbols);
    await updateStockFormulas();
    await updateDuplicateStocks();
    pool.end();
  } catch (err) {
    console.log(err);
  }
};

//identifies duplicate stocks and markets them in DB
const updateDuplicateStocks = async () => {
  let result = await pool.query(`SELECT
  name, array_agg(symbol) as symbols, array_agg(market_cap) as market_caps,
  array_agg(fractionable) as fractionable, array_agg(last_trade) as last_trades
  FROM stocks GROUP BY name HAVING count(1)>1;`);

  await pool.query(`UPDATE stocks SET duplicate = null`);

  for (let i = 0; i < result.rows.length; i++) {
    let symbol = await identifyDuplicate(result.rows[i]);
    await pool.query("UPDATE stocks SET duplicate = true where symbol = $1", [
      symbol,
    ]);
  }
};

//given an object with two symbols return the one that should be excluded
const identifyDuplicate = async (obj) => {
  if (obj.fractionable[0] === obj.fractionable[1]) {
    if (obj.market_caps[0] < obj.market_caps[1]) {
      return obj.symbols[0];
    } else {
      return obj.symbols[1];
    }
  } else {
    if (obj.fractionable[0] === true) {
      return obj.symbols[1];
    } else {
      return obj.symbols[0];
    }
  }
};

//update market caps and spreads
const updateStockFormulas = async () => {
  await pool.query(`UPDATE stocks SET spread = null`);
  await pool.query(`UPDATE stocks SET spread = 100*(best_ask - best_bid)/best_bid
    WHERE best_bid > 0 AND best_ask > 0`);
  await pool.query(`UPDATE stocks SET market_cap = shares * last_trade`);
};

//given a list of symbols, return prices from alpaca
const updatePricesFromAlpaca = async (symbols) => {
  for (let i = 0; i < symbols.length; i += 250) {
    console.log("pulling prices: " + i + "-" + (i + 250));
    let path =
      "/v2/stocks/snapshots?symbols=" + symbols.slice(i, i + 250).join(",");
    let response = await axios.get(alpacaUrls.data + path, alpacaOptions);
    let data = response.data;
    for (k in data) {
      let sql = `UPDATE stocks SET last_trade = $2, best_bid = $3, best_ask = $4 where symbol = $1;`;
      await pool.query(sql, [
        k,
        data[k].latestTrade.p,
        data[k].latestQuote.bp,
        data[k].latestQuote.ap,
      ]);
    }
  }
};

//gets a list of all symbols that we need to update
const getAllSymbols = async () => {
  let result = await pool.query("select symbol from stocks");
  return result.rows.map((x) => x.symbol);
};

main();
