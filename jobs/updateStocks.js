/**************************************
 * jobs/updateOrders.js
 * scrape the top 3000 stocks from finviz
 * insert into the stocks table
 * Runs DAILY
 ***************************************/
const { pool, alpacaOptions, alpacaUrls } = require("./_connections.js");
const axios = require("axios");

const main = async () => {
  try {
    let assetMap = await getAlpacaAssetMap();
    for (let page = 1; page < 3000; page += 20) {
      console.log("Finviz pulling page: " + (page - 1) + "-" + (page + 19));
      let output = await parseFinvizData(page, assetMap);
      await insertRowsIntoDb(output);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    pool.end();
    console.log("Finished Pulling FinViz data");
  } catch (error) {
    console.log(error);
  }
};

const insertRowsIntoDb = async (out) => {
  //insert rows into db
  for (let i = 0; i < out.length; i++) {
    let sql = `INSERT INTO stocks
        (symbol, name, sector, industry, coutry, shares, status, tradable, fractionable, last_updated)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (symbol)
        DO
          UPDATE SET name = $2, sector = $3, industry = $4, coutry = $5, shares = $6,
          status = $7, tradable = $8, fractionable = $9, last_updated = $10
        `;
    await pool.query(sql, out[i]);
  }
};

//given a page of FinvizData, return an array of values
//https://finviz.com/screener.ashx?v=111&o=-marketcap&r={PAGE}
//[ticker, name, industry, sector, country, outstandingshares, status, tradable, fractionable]
const parseFinvizData = async (page, map) => {
  //Get the Raw Data from FinViz
  let url = "https://finviz.com/screener.ashx?v=111&o=-marketcap&r=" + page;
  const response = await axios.get(url);
  const html = response.data.split("\n");
  let textToParse = "";
  for (let i = 0; i < html.length; i++) {
    if (html[i].indexOf("screener-body-table") !== -1) {
      textToParse += html[i];
    }
  }

  //parse the results
  let results = await textToParse.match(/>(.*?)</gm);
  results = await results
    .map((x) => x.substr(1, x.length - 2).replace("&nbsp;", ""))
    .filter((x) => x.length > 0 && x.indexOf("offset") === -1);

  //put output
  let out = [];
  for (let i = 0; i < results.length; i += 13) {
    //push the html parsed results
    let ticker = results[i + 2].replace("-", ".");
    out.push([
      ticker,
      results[i + 1],
      results[i + 4],
      results[i + 5],
      results[i + 6],
      (parseFloat(results[i + 7].slice(0, -1)) *
        (results[i + 7].slice(-1) === "M" ? 1000000 : 1000000000)) /
        parseFloat(results[i + 10]),
      map[ticker] !== undefined ? map[ticker].status : null,
      map[ticker] !== undefined ? map[ticker].tradable : null,
      map[ticker] !== undefined ? map[ticker].fractionable : null,
      new Date(),
    ]);
  }

  return out;
};

//build map of all alpaca assets {symbol => {status, tradeable, fractionable}}
const getAlpacaAssetMap = async () => {
  let path = "/v2/assets";
  let response = await axios.get(alpacaUrls.stock + path, alpacaOptions);
  let data = response.data;

  let map = {};
  for (let i = 0; i < data.length; i++) {
    map[data[i].symbol] = {
      status: data[i].status,
      tradable: data[i].tradable,
      fractionable: data[i].fractionable,
    };
  }
  return map;
};

main();
