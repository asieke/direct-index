const express = require("express");
const router = express.Router();

const getAccountBalances = require("../controllers/accounts.controller.js");

router.get("/", getAccountBalances);

module.exports = router;
