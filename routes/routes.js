const express = require("express");
const router = express.Router();

const getAccountBalances = require("../controllers/accounts.controller.js");
const getPositions = require("../controllers/positions.controller.js");
const getStocks = require("../controllers/stocks.controller.js");

router.get("/", getAccountBalances);
router.get("/positions", getPositions);

router.get("/stocks", getStocks);

module.exports = router;
