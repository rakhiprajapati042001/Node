const config = {
    DB_HOST: "localhost",
    DB_PORT: "3307",
    DB_USERNAME: "root",
    DB_PASSWORD: "",
    // DB_NAME: "ubankconnect",
    DB_NAME: "bankconnect",

  
    // JWT DATA
    JWT_EXPIRY_TIME: "1h",
    JWT_SECRET_KEY: "ubankconnect",
  };
  
  module.exports = config;


  // SELECT 
  //   CONCAT(
  //       'Total Amount: $',
  //       FORMAT(
  //           (
  //               SELECT COALESCE(SUM(payin_charges), 0) 
  //               FROM tbl_merchant_transaction 
  //               WHERE status = 1 AND DATE(created_on) = '2024-04-23'
  //           ) 
  //           +
  //           (
  //               SELECT COALESCE(SUM(charges), 0) 
  //               FROM tbl_settlement 
  //               WHERE status = 1 AND DATE(created_on) = '2024-04-23'
  //           )
  //           +
  //           (
  //               SELECT COALESCE(SUM(akonto_charge), 0) 
  //               FROM tbl_icici_payout_transaction_response_details 
  //               WHERE status = 'SUCCESS' AND DATE(created_on) = '2024-04-23'
  //           ),
  //           2
  //       )
  //   ) AS total_amount_string;
