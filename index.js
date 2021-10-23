require("dotenv").config();
const express = require("express");
const app = express();
const pool = require("./db");
const PORT = process.env.PORT || 5000;

app.use(express.json());

//Routes

//get all stocks

app.get("/", async (req, res) => {
  try {
    const results = await pool.query("SELECT * FROM stocks");
    res.status(200).json({
      status: "success",
      results: results.rows.length,
      data: results.rows,
    });
  } catch (err) {
    console.error(err.message);
  }
  const allTickers = pool;
});

app.post("/stocks", async (req, res) => {
  try {
    const { ticker } = req.body;
    const newStock = await pool.query(
      "INSERT INTO stocks (ticker) VALUES ($1) RETURNING *",
      [ticker]
    );
    res.json(newStock);
  } catch (err) {
    console.error(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
