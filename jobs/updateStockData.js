const { pool, alpaca } = require("./_connections.js");
const axios = require("axios");

(async () => {
  try {
    for (page = 1; page < 3000; page += 20) {
      console.log("Finviz pulling page: " + page);
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
        ]);
      }

      for (let i = 0; i < out.length; i++) {
        let sql = `INSERT INTO stockdata
        (symbol, name, sector, industry, coutry, shares)
        VALUES
        ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (symbol)
        DO
          UPDATE SET name = $2, sector = $3, industry = $4, coutry = $5, shares = $6
        `;
        await pool.query(sql, out[i]);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    pool.end();
  } catch (error) {
    console.log(error);
  }
})();
