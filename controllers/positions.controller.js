const pool = require("../db");

const getPositions = async (req, res) => {
  try {
    const results = await pool.query(sql);
    res.status(200).json({
      status: "success",
      results: results.rows.length,
      data: results.rows,
    });
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = getPositions;

const sql = `select
o.symbol,
o.current,
s.last_trade,
o.current * s.last_trade as market_value
from (
  select
    symbol,
    sum(case when side='buy' then filled_qty else 0 end) - sum(case when side='sell' then filled_qty else 0 end) as current
  from orders
  group by symbol
) o
left join stocks s on o.symbol = s.symbol
where o.current > 0;`;
