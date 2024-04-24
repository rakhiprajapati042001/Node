const mysql=require("mysql");
const util=require("util");
const config=require('./config.js');

var connection=mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
});

connection.connect(function (err) {
    if (err) {
      console.log("error to connect with database")
    } else {
      console.log(`connection created with Database successfully✅`);
    }
  });
  
  const query = util.promisify(connection.query).bind(connection);
  
  module.exports = query;


 