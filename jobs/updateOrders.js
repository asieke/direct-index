/**************************************
 * jobs/updateOrders.js
 * pull all closed orders from Alpaca
 * insert into "orders" table
 * Runs ad hoc
 ***************************************/

const { pool, alpacaOptions, alpacaUrls } = require("./_connections.js");
const axios = require("axios");

const main = async () => {
  try {
    let maxDate = await getMostRecentOrderDate();
    let orders = await getOrders(maxDate);
    await insertOrdersIntoDB(orders);
    pool.end();
  } catch (err) {
    console.log(err);
  }
};

//takes an array of order values and inserts them into the DB
const insertOrdersIntoDB = async (orders) => {
  for (let i = 0; i < orders.length; i++) {
    let sql = `INSERT INTO orders (
      id, client_order_id, created_at, submitted_at, filled_at, asset_id, symbol,
      notional, qty, filled_qty, filled_avg_price, type, side)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
    await pool.query(sql, orders[i]);
  }
};

//pulls a list of all orders (not currently in DB) from Alpaca
const getOrders = async (after) => {
  let path = `/v2/orders?after=${after}&limit=500&status=closed&direction=asc`;
  const response = await axios.get(alpacaUrls.stock + path, alpacaOptions);
  return response.data.map((x) => [
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

//returns the most recent order date from the DB
const getMostRecentOrderDate = async () => {
  var result = await pool.query("SELECT max(submitted_at) FROM orders");
  var maxDate = (await result.rows[0].max)
    ? result.rows[0].max
    : "2000-01-01T00:00:00.000Z";
  return maxDate;
};

main();
