const { pool, alpacaOptions, alpacaUrls } = require("./_connections.js");
const axios = require("axios");

console.log(alpacaUrls);

const main = async () => {
  let path = `/v2/account/activities`;
  let response = await axios.get(alpacaUrls.stock + path, alpacaOptions);
  console.log(response.data);
};

main();
