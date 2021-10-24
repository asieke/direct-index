require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const routes = require("./routes/routes");

app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
