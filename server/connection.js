const connection = async (ctx, accessToken, shop) => {
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "shippingbar"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  return "Connected!";
});
};
module.exports = connection;