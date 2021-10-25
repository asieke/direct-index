const { pool, alpaca } = require("./_connections.js");

const updateAssets = async () => {
  try {
    //pull a list of all active assets from alpaca
    let data = await alpaca.getAssets();

    //keep only fractionable assets that are not already in db
    var values = await data.map((x) => [
      x.id,
      x.symbol,
      x.name,
      x.status,
      x.fractionable,
    ]);

    for (let i = 0; i < values.length; i++) {
      let sql = `
        INSERT INTO assets (id, symbol, name, status, fractionable) VALUES
        ($1, $2, $3, $4, $5)
        ON CONFLICT (id)
        DO
          UPDATE SET symbol = $2, name = $3, status = $4, fractionable = $5`;
      await pool.query(sql, values[i]);
    }
    pool.end();
  } catch (error) {
    console.error("Couldn't fetch asset data", error);
  }
};

updateAssets();
