const pool = require("../db");

const sql = `SELECT * from stocks order by ID asc limit 10`;

const getStocks = async (req, res) => {
  try {
    let limit = req.query.limit || 500;

    const results = await pool.query(
      "SELECT * from stocks order by id asc limit $1",
      [limit]
    );
    res.status(200).json({
      status: "success",
      results: results.rows.length,
      data: results.rows,
    });
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = getStocks;
