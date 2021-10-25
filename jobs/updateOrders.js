/**************************************
 * jobs/updateOrders.js
 * pull all closed orders from Alpaca
 * insert into "orders" table
 * Runs ad hoc
 ***************************************/

const { pool, alpaca } = require("./_connections.js");

const updateOrders = async () => {
  //query postgres and get the most recently added order
  var result = await pool.query("SELECT max(submitted_at) FROM orders");
  var maxDate = (await result.rows[0].max)
    ? result.rows[0].max
    : "2000-01-01T00:00:00.000Z";

  //fetch alpaca order data *after* most recent order
  var orders = await alpaca.getOrders({
    status: "closed",
    limit: 500,
    direction: "asc",
    after: maxDate,
  });

  //insert the order data into postgres
  let values = getOrderInsertArray(orders);
  for (let i = 0; i < values.length; i++) {
    let sql = `INSERT INTO orders (
      id, client_order_id, created_at, submitted_at, filled_at, asset_id, symbol,
      notional, qty, filled_qty, filled_avg_price, type, side)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
    await pool.query(sql, values[i]);
  }
  pool.end();
};

//return a formatted array of arrays to be inserted into psql
const getOrderInsertArray = (json) => {
  return json.map((x) => [
    x.id,
    x.client_order_id,
    x.created_at,
    x.submitted_at,
    x.filled_at,
    x.asset_id,
    x.symbol,
    x.notional,
    x.qty,
    x.filled_qty,
    x.filled_avg_price,
    x.type,
    x.side,
  ]);
};

updateOrders();
