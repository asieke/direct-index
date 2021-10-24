const { pool, alpaca } = require("./_connections.js");

alpaca.getAccount().then((account) => {
  let query = "INSERT INTO account_balances (balance) VALUES ($1)";
  pool.query(query, [account.equity]);
  pool.end();
  console.log(account);
});
