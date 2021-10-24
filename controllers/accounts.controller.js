const pool = require("../db");

const getAccountBalances = async (req, res) => {
  try {
    const results = await pool.query(
      "SELECT * FROM orders ORDER BY submitted_at"
    );
    res.status(200).json({
      status: "success",
      results: results.rows.length,
      data: results.rows,
    });
  } catch (err) {
    console.error(err.message);
  }
  const allTickers = pool;
};

module.exports = getAccountBalances;
