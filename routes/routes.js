const express = require("express");
const router = express.Router();

const getAccountBalances = require("../controllers/accounts.controller.js");
const getPositions = require("../controllers/positions.controller.js");

router.get("/", getAccountBalances);
router.get("/positions", getPositions);

module.exports = router;
