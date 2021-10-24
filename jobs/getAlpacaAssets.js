const { pool, alpaca } = require("./_connections.js");

const getAlpacaAssets = async () => {
  try {
    let result = await pool.query("SELECT id FROM assets");
    let existingIds = result.rows.map((x) => x.id);

    let data = await alpaca.getAssets({
      status: "active",
    });

    var values = await data
      .filter((x) => x.fractionable)
      .filter((x) => existingIds.indexOf(x.id) === -1)
      .map((x) => [x.id, x.symbol, x.name, x.status, x.fractionable]);

    for (let i = 0; i < values.length; i++) {
      let sql = `INSERT INTO assets (id, symbol, name, status, fractionable) VALUES
        ($1, $2, $3, $4, $5)`;
      await pool.query(sql, values[i]);
    }
    pool.end();
  } catch (error) {
    console.error("Couldn't fetch asset data", error);
  }
};

getAlpacaAssets();
