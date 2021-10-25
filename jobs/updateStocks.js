/**************************************
 * jobs/updateOrders.js
 * scrape the top 3000 stocks from finviz
 * insert into the stocks table
 * Runs DAILY
 ***************************************/

const { pool, alpaca } = require("./_connections.js");
const axios = require("axios");

const updateStockData = async () => {
  try {
    //build map of all alpaca assets {symbol => {status, tradeable, fractionable}}
    let data = await alpaca.getAssets();
    let map = {};
    for (let i = 0; i < data.length; i++) {
      map[data[i].symbol] = {
        status: data[i].status,
        tradable: data[i].tradable,
        fractionable: data[i].fractionable,
      };
    }

    //iterate through each page and pull HTML
    for (page = 1; page < 3000; page += 20) {
      console.log("Finviz pulling page: " + (page - 1) + "-" + (page + 19));
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
        out.push([
          results[i + 2].replace("-", "."),
          results[i + 1],
          results[i + 4],
          results[i + 5],
          results[i + 6],
          (parseFloat(results[i + 7].slice(0, -1)) *
            (results[i + 7].slice(-1) === "M" ? 1000000 : 1000000000)) /
            parseFloat(results[i + 10]),
          map[results[i + 2].replace("-", ".")].status,
          map[results[i + 2].replace("-", ".")].tradable,
          map[results[i + 2].replace("-", ".")].fractionable,
        ]);
      }

      //insert rows into db
      for (let i = 0; i < out.length; i++) {
        let sql = `INSERT INTO stocks
        (symbol, name, sector, industry, coutry, shares, status, tradable, fractionable)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (symbol)
        DO
          UPDATE SET name = $2, sector = $3, industry = $4, coutry = $5, shares = $6,
          status = $7, tradable = $8, fractionable = $9
        `;
        await pool.query(sql, out[i]);
      }

      //wait 500ms to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    pool.end();
  } catch (error) {
    console.log(error);
  }
};

updateStockData();
