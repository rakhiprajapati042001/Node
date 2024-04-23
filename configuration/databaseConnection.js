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


  // SELECT 
  //   FORMAT(
  //       (
  //           SELECT COALESCE(SUM(payin_charges), 0) 
  //           FROM tbl_merchant_transaction 
  //           WHERE status = 1 AND DATE(created_on) = '2024-04-23'
  //       ), 
  //       2
  //   ) AS sum_payin_charges_formatted,
  //   FORMAT(
  //       (
  //           SELECT COALESCE(SUM(charges), 0) 
  //           FROM tbl_settlement 
  //           WHERE status = 1 AND DATE(created_on) = '2024-04-23'
  //       ), 
  //       2
  //   ) AS sum_settlement_charges_formatted,
  //   FORMAT(
  //       (
  //           SELECT COALESCE(SUM(akonto_charge), 0) 
  //           FROM tbl_icici_payout_transaction_response_details 
  //           WHERE status = 'SUCCESS' AND DATE(created_on) = '2024-04-23'
  //       ), 
  //       2
  //   ) AS sum_akonto_charge_formatted,
  //   FORMAT(
  //       (
  //           SELECT COALESCE(SUM(payin_charges), 0) 
  //           FROM tbl_merchant_transaction 
  //           WHERE status = 1 AND DATE(created_on) = '2024-04-23'
  //       ) 
  //       +
  //       (
  //           SELECT COALESCE(SUM(charges), 0) 
  //           FROM tbl_settlement 
  //           WHERE status = 1 AND DATE(created_on) = '2024-04-23'
  //       )
  //       +
  //       (
  //           SELECT COALESCE(SUM(akonto_charge), 0) 
  //           FROM tbl_icici_payout_transaction_response_details 
  //           WHERE status = 'SUCCESS' AND DATE(created_on) = '2024-04-23'
  //       ),
  //       2
  //   ) AS total_amount_formatted;
