const mysqlcon = require('../configuration/databaseConnection')
const emailvalidator = require('email-validator')
const dateTime = require('node-datetime')
const jwt = require("jsonwebtoken");
const fast2sms = require('fast-two-sms')
const dotenv = require('dotenv')
const twilio = require('twilio');
const sendMail = require("../sendMail")
var dt = dateTime.create();
var formatted_date = dt.format("Y-m-d H:M:S");
const Md5 = require('md5');
const config = require('../configuration/config');
const md5 = require('md5');
const otpGenerate = require('otp-generator');
const { appendFile } = require('fs');
const path = require('path');
const zlib = require('zlib');
const Excel = require('exceljs');
const pdfDoc = require('pdfkit');
// const assert = require('assert');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require("multer");
const { log } = require('console');
// const crypto = require('crypto');
const bcrypt = require('bcryptjs');
dotenv.config();

const storage = multer.memoryStorage();
const uploads = multer({ storage: storage });



module.exports.excelExport = async function (req, res) {

  try {

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Countries List');

    let sql = "SELECT * FROM module"
    let dataSet = await mysqlcon(sql);

    const headers = Object.keys(dataSet[0]);
    worksheet.addRow(headers);

    dataSet.forEach(dataSet => {
      const values = Object.values(dataSet);
      worksheet.addRow(values);

    });

    const filePath = 'dataSet.xlsx';
    workbook.xlsx.writeFile(filePath)
      .then(() => {
        console.log('Excel file created successfully');

        // Serve the Excel file as a downloadable attachment
        res.download(filePath, 'dataSet.xlsx', (err) => {
          if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Internal Server Error');
            return;
          }
        })

      })
  } catch (error) {
    console.log(error);
    res.status(500)
      .json({ status: false, message: "Error to complete task." });
  }

}


module.exports.pdfDownload = 



module.exports.signUP = async function (req, res) {
  try {
    var data = req.body;
    if (data) {

      const datas = { userName: data.userName, userEmail: data.userEmail, password: data.password, confirmPassword: data.confirmPassword };
      if (Object.values(datas).every(value => value === '')) {
        // All fields are empty
        res.status(400).json({
          status: false,
          message: "All fields are empty. Please provide valid data.",
          data: [],
        });
        return;
      } if (!data.userName) {
        res.status(201).json({
          status: false,
          message: "Enter UserName",
          data: [],
        });
        return true;
      } if (data.userEmail && emailvalidator.validate(data.userEmail)) {
        // if(data.userEmail!=data.confirmEmail){
        //       res.status(201).json({
        //           status: false,
        //           message: "Email and confirm email not match",
        //           data: [],
        //         });
        //         return true;
        //       }

        let existEmailId = "SELECT id FROM tbl_signup where userEmail = ? "
        let userId = await mysqlcon(existEmailId, data.userEmail);
        console.log(Object.keys(userId))
        console.log(Object.keys(userId) != [])
        if (Object.keys(userId).length > 0) {

          res.status(201).json({
            status: false,
            message: "Email Id is already exist",
            data: [],
          });
          return true;
        } if (data.password) {
          if (data.password != data.confirmPassword) {
            res.status(201).json({
              status: false,
              message: "password and confirm password not match",
              data: [],
            });
            return true;
          }
          var user_data = {
            userName: data.userName,
            userEmail: data.userEmail,
            password: Md5(data.password),
            confirmPassword: Md5(data.password),
            createdDate: formatted_date,
            updated_on: formatted_date,

          };
          sql = "INSERT INTO tbl_signup SET ?";
          var response = await mysqlcon(sql, [user_data]);

          if (response) {
            //send email on mail id when profile created successfully of user
            sendMail.sendEmail(data.userEmail);
            res.status(200).json({
              status: true,
              message: "Profile created successfully",
              data: user_data,
            })
          } else {
            res.status(201).json({
              status: false,
              message: "Error to create profile",
              data: [],
            });
          }
        } else {
          res.status(201).json({
            status: false,
            message: "Please Enter a password",
            data: [],
          });
        }
      } else {
        res.status(201).json({
          status: false,
          message: "Please Enter a Valid EmailId",
          data: [],
        });
      }
    } else {
      res.status(201).json({
        status: false,
        message: "Data not found. Please provide valid data",
        data: [],
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500)
      .json({ status: false, message: "Error to complete task.", data: [] });
  }
}

//     module.exports.login=async function(req,res){

//       const { email, password } = req.body;
//       try{
//         if(email && password){
//           if(emailvalidator.validate(email)){

//            let sql="select id from tbl_signup where userEmail =?"
//             let user_id=await mysqlcon(sql,[email])
//                if(Object.keys(user_id).length > 0){
//                   let id=user_id[0].id;


//            let sql2="select password from tbl_signup where userEmail =?"
//            let pass=await mysqlcon(sql2,[email])
//                   if(pass[0].password===Md5(password)){

//                   let token= jwt.sign({user_id},config.JWT_SECRET_KEY,{expiresIn:config.JWT_EXPIRY_TIME})
//                    //store token in local storage
//                    console.log("token:"+token)
//                   //  window.localStorage.setItem('token',token)
//                  if(token){
//                   return res.status(200).json({
//                     message: "Login Successful✅",
//                     token: token,
//                     Status: true,
//                     // userDetails: userDetails,

//                   });
//                   }
//                 }else{
//                   return res.status(200).json({
//                     message: "password is not correct",
//                     status: false,
//                   })
//               }}else{
//                 return res.status(201).json({
//                   "status":"true",
//                    "message":"User does not exist"
//                    })
//              }} else{
//             return res.status(201).json({
//               "message":"Enter Valid Email id"
//             })
//           } 
//         }else{
//           return res.status(400).json({
//             "status":false,
//             "message":"Enter all details"
//           })
//         }
//       } catch(error){
//         console.log(error);
//         return res.json(500, {
//           message: "error",
//           error: error,
//    })
//   }
// }


//   module.exports.login=async function(req,res){

//     const { email, password } = req.body;
//     try{
//       if(email && password){
//         if(emailvalidator.validate(email)){

//          let sql="select id from tbl_signup where userEmail =? and password=?"
//           let user_id=await mysqlcon(sql,[email,Md5(password)])
//              if(Object.keys(user_id).length > 0){
//                 let id=user_id[0].id;

//                let sql="select * from tbl_signup where id =?"
//                const userDetails=await mysqlcon(sql,[id])
//                console.log(Object.values(userDetails)+"userDetails")
//                console.log("end")

//                 let token= jwt.sign({user_id},config.JWT_SECRET_KEY,{expiresIn:config.JWT_EXPIRY_TIME})
//                  //store token in local storage
//                  console.log("token:"+token)
//                 //  window.localStorage.setItem('token',token)
//                if(token){
//                 return res.status(200).json({
//                   message: "Login Successful✅",
//                   token: token,
//                   Status: true,
//                   // userDetails: userDetails,

//                 });
//                 }}else{
//               return res.status(201).json({
//                 "status":"true",
//                  "message":"User does not exist"
//                  })
//            }} else{
//           return res.status(201).json({
//             "message":"Enter Valid Email id"
//           })
//         } 
//       }else{
//         return res.status(400).json({
//           "status":false,
//           "message":"Enter all details"
//         })
//       }
//     } catch(error){
//       console.log(error);
//       return res.json(500, {
//         message: "error",
//         error: error,
//  })
// }
// }

module.exports.createUserProfile = async function (req, res) {



}

module.exports.changePassword = async function (req, res) {

  let { oldPassword, newPassword, confirmPassword } = req.body;
  console.log(oldPassword, newPassword, confirmPassword);

  let user = req.user
  let id = user.id;
  console.log(Object.keys(user) + "userrrrr");
  console.log(id + "id")
  try {
    console.log("start")
    console.log(oldPassword, newPassword, confirmPassword);
    if (oldPassword && newPassword && confirmPassword) {
      console.log(oldPassword)

      let sql = "select password from tbl_signup where id =?"
      let data = await mysqlcon(sql, id);
      console.log(data[0].password + "pppp")

      if (newPassword !== confirmPassword) {

        if (oldPassword !== newPassword) {
          oldPassword = Md5(oldPassword);
          newPassword = md5(newPassword)
          console.log(newPassword)
          if (oldPassword == data[0].password) {

            let sql2 = "UPDATE tbl_signup SET password = ? , confirmPassword = ? where id=?"
            console.log(sql2)
            let result = await mysqlcon(sql2, [newPassword, newPassword, id])
            console.log(result)

            if (Object.values(result).length > 0) {
              return res.json(200, {
                message: "Password Change Successfully✅"
              },)
            }
          } else {
            return res.json(
              "status", "401",
              "message", "the old Password is incorrect");
          }


        } else {
          return res.json(
            "status", "401",
            "message", "the new password and cornfirm password is not same");
        }
      }
      else {
        return res.json(
          "status", "201",
          "message", "New Password and Old Password is Same");
      }
    } else {
      return res.json(
        "status", "401",
        "message", "fill all feild");
    }
  } catch (error) {
    console.log(error);
    return res.json(500, {
      message: "error occurered",
      error: error,
    })
  }
}

module.exports.sendOtp = async function (req, res) {

  const userEmail = req.body;
  let mailId = Object.values(userEmail);

  try {

    otp = otpGenerate.generate(6, {
      digits: true,
      specialChars: false,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false

    })

    let sql = 'UPDATE tbl_signup SET otp = ? where userEmail =?'
    console.log(sql)
    let result = await mysqlcon(sql, [otp, mailId])
    if (result) {
      sendMail.sendEmail(Object.values(userEmail), otp)
      res.status(200).json({
        status: true,
        message: "otp send successfully on this emailId",
        data: Object.values(userEmail),
      })
    } else {
      res.json({
        status: true,
        message: "Something Went wrong please try again!",
        data: Object.values(userEmail),
      })
    }
  } catch (error) {
    res.json({
      status: true,
      message: error,
    })
  }
}

module.exports.forgetPassword = async function (req, res) {

  const data = req.body;
  console.log(data.userEmail);
  console.log(data.otp);
  let mailId = Object.values(data.userEmail);
  try {
    console.log("srart");
    let sql5 = 'SELECT otp FROM tbl_signup WHERE userEmail = ?';


    let result = await mysqlcon(sql5, [data.userEmail])
    if (result) {
      console.log(result[0].otp + "result");
      if (data.otp == result[0].otp) {

        console.log("srart9988888888888");
        let sql2 = 'UPDATE tbl_signup SET otp = Null where userEmail =?';
        let ress = await mysqlcon(sql2, [data.userEmail])

        console.log(sql2);
        res.json({
          status: true,
          message: "Otp Varify ",
        })
      } else {
        res.json({
          status: true,
          message: "Enter otp is not correct tr Again :)",
        })
      }
    } else {
      res.json({
        status: true,
        message: "Something went wrong",
        data: Object.values(userEmail),
      })
    }

  } catch (error) {
    res.json({
      status: true,
      message: error,
    })

  }


}


module.exports.login = async function (req, res) {

  const { email, password } = req.body;
  try {

    console.log(email, password);
    if (email && password) {
      if (emailvalidator.validate(email)) {

        let sql = "select id from tbl_signup where userEmail =?"
        let user_id = await mysqlcon(sql, [email])
        if (Object.keys(user_id).length > 0) {
          let id = user_id[0].id;
          let sql2 = "select password from tbl_signup where userEmail =?"
          let pass = await mysqlcon(sql2, [email])

          if (pass[0].password === Md5(password)) {
            let sql2 = "select * from tbl_signup where userEmail =?"
            let result = await mysqlcon(sql2, [email])

            // if(result[0]?.role === 0){
            //       return res.status(202).json({
            //         message:"Role not Assign"
            //       })
            //     }


            let token = jwt.sign({ user_id }, config.JWT_SECRET_KEY, { expiresIn: config.JWT_EXPIRY_TIME })
            //store token in local storage
            console.log("token:" + token)
            //  window.localStorage.setItem('token',token)
            if (token) {
              return res.status(200).json({
                message: "Login Successful✅",
                token: token,
                Status: true,
                // userDetails: userDetails,

              });
            }
          } else {
            return res.status(200).json({
              message: "password is not correct",
              status: false,
            })
          }
        } else {
          return res.status(201).json({
            "status": "true",
            "message": "User does not exist"
          })
        }
      } else {
        return res.status(201).json({
          "message": "Enter Valid Email id"
        })
      }
    } else {
      return res.status(400).json({
        "status": false,
        "message": "Enter all details"
      })
    }
  } catch (error) {
    console.log(error);
    return res.json(500, {
      message: "error",
      error: error,
    })
  }
}

module.exports.SMS = async function (req, res) {

  try {
    // const numbers=req.body;

    var options = {
      authorization: process.env.API_KEY,
      message: 'CONGRATULATION YOUR ORDER PLACED SUCCESSFULLY',
      numbers: ['+9696572498']

    }

    const response = await fast2sms.sendMessage(options)
    console.log(response.return)
    if (response.return) {
      res.json({
        "message": "SMS Send Successfully!",
        status: 200
      })
    } else {
      res.json({
        "message": "SMS Not Send",
        status: 411
      })
    }

    console.log(options);

  } catch (err) {
    console.log(err),
      res.json({
        "message": "Something Went Wrong!",
        status: 411
      })
  }


}

module.exports.twilio = async function (req, res) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  try {
    //  console.log(client+"client");
    // Send SMS message
    const message = await client.messages.create({
      body: 'This is a test message from Twilio API Rakhi akonto',
      from: '+18155970737', // Replace with your Twilio phone number
      to: '+919582627348' // Replace with the recipient's phone number
    });
    // console.log(message+"message");
    if (message) {
      res.json({
        "message": "message send successfully!",
        "sms": message.sid
      })
    } else {
      res.json({
        "message": "something went wrong!"
      })
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

// module.exports.excel=async function(req,res){

//   // let sql="select password from tbl_signup where id =?"
//   // let data= await mysqlcon(sql,id);
//   connection.mysqlcon('SELECT * FROM your_table', (err, results, fields) => {
//     if (err) {
//       console.error('Error querying database:', err);
//       connection.end(); // Close the database connection
//       return;
//     }

//  // Create a new Excel workbook and worksheet
//  const workbook = new exceljs.Workbook();
//  const worksheet = workbook.addWorksheet('Sheet1');
//   }


// )}


module.exports.getModule = async function (req, res) {

  const parentId = req.body.parentId
  const idsArray = parentId.split(',').map(id => parseInt(id.trim(), 10));
  console.log(parentId + "parentId");
  console.log(idsArray + "idsArray");

  try {

    // let sql2='SELECT name  FROM module  WHERE parent_menu_id = (SELECT id FROM module WHERE name = ?)'
    let sql2 = `SELECT *  FROM module  WHERE parent_menu_id IN (?)`

    let ress = await mysqlcon(sql2, idsArray)
    console.log(sql2 + "sql2");

    console.log(Object.values(ress).length + "ress");

    if (Object.values(




      ress).length == 0) {
      res.json({
        "message": "module does not exist on this parent Id Please enter a valid Parent id",
        status: 201,
      })
      return
    }

    if ((Object.values(ress).length) > 0) {
      res.json({
        "message": "Sub Modules Fetch Successfully!",
        status: 200,
        "data": ress
      })
    } else {
      res.json({
        "message": "Something went wrong to fetch sub modules",
        status: 401
      })
    }

  } catch (err) {
    console.log(err),
      res.json({
        "message": "Something Went Wrong!",
        status: 201
      })
  }

}


module.exports.addModule = async function (req, res) {
  const data = req.body
  const img = req.file;
  try {

    var moduleData = {
      name: data.name,
      parent_menu_id: data.parent_menu_id,
      status: data.status,
      image: img.originalname,
      description: data.description,
      created_date: formatted_date,
      updated_date: formatted_date,

    };
    sql = "INSERT INTO module SET ?";
    var response = await mysqlcon(sql, [moduleData]);

    if (response) {
      res.json({
        "message": "add Sub Modules  Successfully!",
        status: 200,
        "data": response
      })
    } else {
      res.json({
        "message": "Somethig went wrong",
        status: 201,

      })
    }
  } catch (err) {
    console.log(err),
      res.json({
        "message": "Something Went Wrong!",
        status: 201
      })
  }

}

module.exports.updateModuled = async function (req, res) {
  const data = req.body
  const id = req.body.id
  const img = req.file;
  try {

    var moduleData = {
      name: data.name,
      parent_menu_id: data.parent_menu_id,
      status: data.status,
      image: img.originalname,
      description: data.description,
      created_date: formatted_date,
      updated_date: formatted_date,

    };
    sql = "UPDATE module SET ? where id=?";
    var response = await mysqlcon(sql, [moduleData, id]);

    if (response) {
      res.json({
        "message": "Update  Sub Modules  Successfully!",
        status: 200,
        "data": response
      })
    } else {
      res.json({
        "message": "Somethig went wrong",
        status: 201,

      })
    }
  } catch (err) {
    console.log(err),
      res.json({
        "message": "Something Went Wrong!",
        status: 201
      })
  }

}


module.exports.deleteModule = async function (req, res) {

  const id = req.body.id;
  try {
    sql = "delete from module  where id=?";
    var response = await mysqlcon(sql, [id]);

    if (response) {
      res.json({
        "message": "Delete  Sub Modules  Successfully!",
        status: 200,
        "data": response
      })
    } else {
      res.json({
        "message": "Somethig went wrong",
        status: 201,

      })
    }
  } catch (err) {
    console.log(err),
      res.json({
        "message": "Something Went Wrong!",
        status: 201
      })
  }
}


module.exports.getSubModule = async function (req, res) {


  const statusId = req.body.statusId
  console.log(statusId + "statusId");
  try {

    // let sql2='SELECT name  FROM module  WHERE parent_menu_id = (SELECT id FROM module WHERE name = ?)'
    let sql2 = 'SELECT *  FROM module  WHERE status = ?'

    let ress = await mysqlcon(sql2, [statusId])
    console.log(Object.values(ress).length + "ress");
    console.log(sql2 + "sql2");

    if ((Object.values(ress).length) > 0) {
      res.json({
        "message": "Sub Modules Fetch Successfully!",
        status: 200,
        "data": ress
      })
    } else {
      res.json({
        "message": "Something went wrong to fetch sub modules",
        status: 401
      })
    }

  } catch (err) {
    console.log(err),
      res.json({
        "message": "Something Went Wrong!",
        status: 201
      })
  }

}

module.exports.example = async function (req, res) {

  try {

    // let sql2='SELECT name  FROM module  WHERE parent_menu_id = (SELECT id FROM module WHERE name = ?)'
    let tbl = "tbl_code";
    let result = getTableColumns(tbl)
    console.log(result);
    res.send("example Succesfully")




  } catch (err) {
    console.log(err),
      res.json({
        "message": "Something Went Wrong!",
        status: 201
      })
  }

}


module.exports.get_menu = async (req, res) => {
  try {
    const sql = "SELECT * FROM module WHERE parent_menu_id = 0";
    const details = await mysqlcon(sql);

    let data1 = [];

    for (i = 0; i < details.length; i++) {
      // console.log(details[i].id);
      // console.log(details[i].name);
    }

    for (let num = 0; num < details.length; num++) {
      const submenuSql = `SELECT id,name,image,description FROM module WHERE parent_menu_id = ${details[num].id}`;
      const submenus = await mysqlcon(submenuSql);
      let data2 = []

      submenus.forEach(submenu => {
        data2.push({
          id: submenu.id,
          name: submenu.name,
          description: submenu.description,
          image: submenu.image
        });
      });

      data1.push({
        id: details[num].id,
        name: details[num].name,
        description: details[num].description,
        images: details[num].image,

        subdata: data2

      });

    }

    return res.status(200).json({ data1 });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: err });
  }
};




/*another project work apies

module.exports.amount=async (req,res)=>{
try{
     const sql = "SELECT ROUND (SUM(ammount),2) AS total_ammount FROM tbl_merchant_transaction WHERE status = 1  AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
     const deposite = await mysqlcon(sql);

    const sql1 = "SELECT ROUND (SUM(amount),2) AS total_ammount FROM tbl_icici_payout_transaction_response_details WHERE status = 'success' AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    const payout = await mysqlcon(sql1);

    const sql2 = "SELECT ROUND (SUM(ammount),2) AS total_ammount FROM tbl_merchant_transaction WHERE status = 5 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    const Commision = await mysqlcon(sql2);

    const sql3 = "SELECT ROUND (SUM(requestedAmount),2) AS total_ammount FROM tbl_settlement WHERE status = 'success' AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    const settlement = await mysqlcon(sql3);

if(settlement){
    return res.status(200).json({ 
        "message":"Amount fetch Successfully!",
        "deposite":deposite,
          "payout":payout,
         "Commision":Commision,
        "settlement":settlement });
}else{
    res.status(201).json({
        status: false,
        message: "something Wroong!",
       
})
}


}catch(error){
    console.log(error);
    return res.status(404).json({ message: error });
}
}

module.exports.calulatePercentage=async function(req,res){
    try{
 
const sql="SELECT  (COUNT(CASE WHEN status = 0 THEN 1 END) / COUNT(*)) * 100 AS failure_percentage FROM  tbl_merchant_transaction;"
const failureRate = await mysqlcon(sql);

const sql1="SELECT  (COUNT(CASE WHEN status = 1 THEN 1 END) / COUNT(*)) * 100 AS success_percentage FROM  tbl_merchant_transaction;"
const success = await mysqlcon(sql1);

const sql2="SELECT  (COUNT(CASE WHEN status = 3 THEN 1 END) / COUNT(*)) * 100 AS pending_percentage FROM  tbl_merchant_transaction;"
const pending = await mysqlcon(sql2);

const totalCount= ` SELECT (SELECT COUNT(*) FROM tbl_merchant_transaction) AS merchant_transaction_count`;
 const result = await mysqlcon(totalCount);

 let totalCounts=result[0].merchant_transaction_count;
let pendings= pending[0].pending_percentage;
let successe=success[0].success_percentage
let fail=failureRate[0].failure_percentage
console.log(result[0].merchant_transaction_count);
if(failureRate){
    return res.status(200).json({ 
        "message":"Amount fetch Successfully!",
        "table_name":"tbl_merchant_transaction",
        "failureRate":fail,
        "success":successe,
        "pending":pendings,
        "totalCount":totalCounts

          });
       }


    }catch(error){
        console.log(error);
        return res.status(404).json({ message: error });
    }
}
**/



module.exports.importExcelSheet = async (req, res) => {

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }


  const workbook = xlsx.readFile(req.file.path);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  console.log(Object.values(worksheet) + "worksheet");
  const data = xlsx.utils.sheet_to_json(worksheet);
  console.log(data + "dara");
  // Insert data into the database
  data.forEach(row => {


    // Handle blank values and set default values
    const name = row.name || ''; // If name is blank, set it to an empty string
    const parent_menu_id = row.parent_menu_id || 0; // If parent_menu_id is blank, set it to 0
    const status = row.status == '' ? null : row.status;
    console.log(row + "youuuu");
    const sql = 'INSERT INTO module (name, parent_menu_id, status) VALUES (?, ?, ?)'; // Modify as per your table structure
    const values = [name, parent_menu_id, status]; // Adjust according to your Excel columns

    mysqlcon(sql, values, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return;
      }
      console.log('Data inserted successfully:', result);
    });
  });

  // Respond to the client
  res.send('Data uploaded and inserted into the database.');


}


//bank connect database run for vendors 
module.exports.vendors = async (req, res) => {

  try {


    const sql1 = `SELECT 
      FORMAT(SUM(CASE WHEN tbl_merchant_transaction.status = 1 THEN tbl_merchant_transaction.ammount ELSE 0 END), 2) AS Total_Amount, 
      payment_gateway.gateway_name 
  FROM 
      tbl_merchant_transaction 
  JOIN 
      payment_gateway ON tbl_merchant_transaction.gatewayNumber = payment_gateway.id 
  WHERE 
      tbl_merchant_transaction.created_on >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH) 
  GROUP BY 
      tbl_merchant_transaction.gatewayNumber 
  ORDER BY 
      Total_Amount DESC 
  LIMIT 
      10`
    const deposit = await mysqlcon(sql1);

    console.log(deposit);
    const sql2 = `SELECT FORMAT(  SUM(CASE WHEN tbl_icici_payout_transaction_response_details.status = "SUCCESS" THEN  tbl_icici_payout_transaction_response_details.amount ELSE 0 END),2) As Total_Amount FROM tbl_icici_payout_transaction_response_details WHERE created_on >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH) GROUP By amount ORDER BY Total_Amount DESC LIMIT 10`;
    const payout = await mysqlcon(sql2);

    if (deposit && payout) {
      return res.status(200).json({
        message: "Data Fetched Successfully",
        Deposite: deposit,
        Payout: payout

      });

    } else {
      return res.status(400).json({
        "message": "Error while fetching data"
      })

    }

  } catch (err) {
    console.log(err);
    return res.status(201).json({ error: err });
  }



}



module.exports.vendorConnection = async function (req, res) {
  try {
    let sqlquery = `SELECT ROUND(SUM(ammount)) AS total_amount,payment_gateway.gateway_name FROM tbl_merchant_transaction LEFT JOIN payment_gateway ON tbl_merchant_transaction.gatewayNumber = payment_gateway.id WHERE tbl_merchant_transaction.status = 1 AND tbl_merchant_transaction.created_on >= NOW() - INTERVAL 6 MONTH GROUP BY tbl_merchant_transaction.gatewayNumber LIMIT 10`;

    const result = await mysqlcon(sqlquery);

    let allTotalAmounts = '';
    let allGatewayName = '';
    for (let i = 0; i < result.length; i++) {
      allTotalAmounts += result[i].total_amount + ', ';
    }
    for (let j = 0; j < result.length; j++) {
      allGatewayName += result[j].gateway_name + ', '
    }

    //   console.log(allTotalAmounts);
    //   console.log(allGatewayName);

    if (result) {
      return res.status(200).json({
        message: 'Top 10 vendors Data fetched successfully',
        DEPOSITE_AMOUNT: allTotalAmounts, GATEWAY_NAME: allGatewayName
      })
    }
    else {
      return res.status(201).json({ message: 'Unable to fetch data' })
    }
  } catch (err) {
    return res.status(404).json({ err: 'Error occured' + err })
  }
}



module.exports.csv = async (req, res) => {

  try {


    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    console.log(Object.values(worksheet) + "worksheet");
    const data = xlsx.utils.sheet_to_json(worksheet);
    // Insert data into the database
    data.forEach(row => {

      console.log(row.akontocode);
      const sql = 'INSERT INTO tbl_code (type, title,status,code,akontocode,payment_gate,bank_services_charge) VALUES (?,?,?,?,?,?,?)'; // Modify as per your table structure
      const values = [row.type, row.title, row.status, row.code, row.akontocode, row.payment_gate, row.bank_services_charge]; // Adjust according to your Excel columns
      console.log(row.akontocode);

      mysqlcon(sql, values, (err, result) => {
        if (err) {
          console.error('Error inserting data:', err);
          return;
        }
        console.log('Data inserted successfully:', result);
      });

      const sql2 = 'INSERT INTO tbl_akonto_banks_code(type, title, status,code,currencies) VALUES (?, ?, ?,?,?)'; // Modify as per your table structure
      const values2 = [row.type, row.title, row.status, row.code, row.akontocode, row.payment_gate, row.bank_services_charge]; // Adjust according to your Excel columns
      mysqlcon(sql2, values2, (err, result) => {
        if (err) {
          console.error('Error inserting data:', err);
          return;
        }
        console.log('Data inserted successfully:', result);
      });
    });

    // Respond to the client
    res.send('Data uploaded and inserted into the database.');
  } catch (err) {
    console.log(err);
    return res.status(201).json({ error: err });
  }

}


module.exports.csvs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Iterate through each row of data
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Perform insertion into the first table (tbl_code)


      const sql1 = 'INSERT INTO tbl_code (type, title, status, code, akontocode, payment_gate, bank_services_charge) VALUES (?, ?, ?, ?, ?, ?, ?)';

      const values1 = [row.type, row.title, row.status, row.code, row.akontocode, row.payment_gate, row.bank_services_charge];
      await mysqlcon(sql1, values1);





      // Perform insertion into the second table (tbl_akonto_banks_code)
      const sql2 = 'INSERT INTO tbl_akonto_banks_code (type, title, status, code, currencies) VALUES (?, ?, ?, ?, ?)';
      const values2 = [row.type, row.title, row.status, row.code, row.currencies];
      await mysqlcon(sql2, values2);
    }

    // Respond to the client
    res.send('Data uploaded and inserted into the database.');
  } catch (err) {
    console.log(err);
    return res.status(201).json({ error: err });
  }
}


// ````````````````````````````````````````````````````````````````````````````
module.exports.upload_excel = async function (req, res) {
  try {
    // uploads.single('csvexcelFile')(req, res, async function (err) {
    //   if (err) {
    //     console.error('Error handling file upload:', err);
    //     return res.status(500).json({
    //       message: 'File upload error',
    //       error: err,
    //     });


    if (!req.file) {
      console.error('Error handling file upload: No file uploaded');
      return res.status(400).json({
        message: 'No file uploaded',
      });
    }


    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // const workbook = new xlsx.Workbook();
    // await workbook.xlsx.load(req.file.buffer);
    // const worksheet = workbook.worksheets[0];

    const columns = worksheet.getRow(1).values.filter(column => column !== null);
    // res.send(columns)

    const allData = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i).values.filter(column => column !== null);;
      res.send(row)

      const rowData = {};
      columns.forEach((column, index) => {
        rowData[column] = row[index];
      });

      allData.push(rowData);
    }

    const tablesToInsert = ['tbl_code', 'tbl_akonto_banks_code'];

    await Promise.all(tablesToInsert.map(async (tableName) => {
      const existingColumns = await getTableColumns(tableName);

      const tableColumns = columns.filter(column => existingColumns.includes(column));

      if (tableColumns.length > 0) {
        const sql = `INSERT INTO ${tableName} (${tableColumns.join(', ')}) VALUES ?`;

        // Map the data for each column and insert as a single row
        const values = allData.map(rowData => tableColumns.map(column => rowData[column]));

        await mysqlcon(sql, [values]);
      }
    }));

    res.send('File uploaded and data inserted into the database.');
  }
  catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({
      message: 'Server Error',
      error,
    });
  }

}


module.exports.getTableColumns = async function (req, res) {
  try {
    let tableName = req.tableName;
    console.log(tableName + "tableName");
    const query = `SHOW COLUMNS FROM ${tableName}`;
    const columns = await mysqlcon(query);

    // Extract column names from the result
    const columnNames = columns.map(column => column.Field);

    console.log(columnNames + "columnNames");

    // Send the column names as a response
    res.status(200).json({ columns: columnNames });
  } catch (err) {
    console.error('Error fetching table columns:', err);
    res.status(500).json({
      message: 'Server Error',
      error: err
    });
  }
}


module.exports.csvExcelImport = async function (req, res) {


  try {


    if (!req.file) {
      console.error('Error handling file upload: No file uploaded');
      return res.status(400).json({
        message: 'No file uploaded',
      });
    }

    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    // const data = xlsx.utils.sheet_to_json(worksheet);

    console.log("Worksheet keys:", Object.keys(worksheet));



    const columns = worksheet.getRow(1).values.filter(column => column !== null);

    const allData = [];
    console.log("columns" + columns)


  } catch (err) {
    console.error('Error fetching table columns:', err);
    res.status(500).json({
      message: 'Server Error',
      error: err
    });
  }

}


async function getTableColumns(tableName) {
  return new Promise((resolve, reject) => {
    const sql = `SHOW COLUMNS FROM ${tableName}`;
    mysqlcon(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        console.log(results.Field + "result.Field")
        const columns = results.map(result => result.Field);
        console.log(columns + "columns")
        resolve(columns);
      }
    });
  });
}


module.exports.csvExcelImport = async function (req, res) {
  try {


    uploads.single('csvexcelFile')(req, res, async function (err) {
      if (err) {
        console.error('Error handling file upload:', err);
        return res.status(500).json({
          message: 'File upload error',
          error: err,
        });
      }

      if (!req.file) {
        console.error('Error handling file upload: No file uploaded');
        return res.status(400).json({
          message: 'No file uploaded',
        });
      }

      const workbook = new Excel.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.worksheets[0];

      console.log(worksheet.getRow(1).values + "worksheet")


      let columns = worksheet.getRow(1).values.filter(column => column !== null);

      console.log(columns + "columns00000000000000000000000000");

      const allData = [];
      var newdata;
      var merNumber;

      console.log(worksheet.rowCount + "worksheet.rowCount");

      for (let i = 2; i <= worksheet.rowCount; i++) {

        const row = worksheet.getRow(i).values.filter(column => column !== null);
        var rowData = {};
        console.log(row + "row888888888888888");
        // res.send(row)
        console.log(columns + "columnsiii")

        columns.forEach((column, index) => {
          console.log(column + "column");
          console.log(index + "index");

          rowData[column] = row[index];
          console.log(rowData[column] + "rowData[column]" + row[index] + "row[index]")


        });


        newdata = rowData;
        console.log(Object.values(newdata) + "newdata")
        console.log(Object.values(rowData) + "rowData");

        allData.push(rowData);


        console.log(Object.values(allData) + "allData");
      }
      const tablesToInsert = ['tbl_code', 'tbl_akonto_banks_code', 'tbl_merchant_assign'];
      await Promise.all(tablesToInsert.map(async (tableName) => {
        const existingColumns = await getTableColumns(tableName);
        console.log(tableName + "tableName")
        console.log(existingColumns + "existingColumns");
        const extractedValue = [];
        if (tableName === 'tbl_merchant_assign') {
          console.log("start---------------------------")

          const addd = {
            'type': 'type',
            'b_code': 'code',
            'a_code': 'akontcode',
            'mer_no': 'mer_no',
            'status': 'status'

          };
          columns = Object.keys(addd).map(key => key);
          console.log(columns + "--columns")

          console.log(Object.values(allData).forEach(obj => console.log(JSON.stringify(obj)))
            + "allData9999999999999999999999999999999999999");

          const extractedValues = [];

          // Iterate over each object in allData

          allData.forEach(obj => {
            // Extract code and akontocode properties
            const { type, code, akontocode, mer_no, status } = obj;

            // Create a new object with extracted values
            const extractedObject = { type, code, akontocode, mer_no, status };

            // Push the new object into the array
            extractedValues.push(extractedObject);
            extractedValue.push(extractedObject)
          });
          // Log the extracted values
          console.log(extractedValues);


        }



        console.log(columns + "----columns")



        const tableColumns = columns.filter(column => existingColumns.includes(column));

        console.log(tableColumns + "tableColumns");





        if (tableColumns.length > 0) {
          const sql = `INSERT INTO ${tableName} (${tableColumns.join(', ')}) VALUES ?`;


          console.log(sql + "sql");


          // if (tableName === 'tbl_merchant_assign') {
          //   // Map the values from akontcode to a_code and code to b_code
          //   console.log(newdata['akontocode']+"newdata['akontocode']")
          //   console.log( newdata['code']+" newdata['code']")
          //   newdata['a_code'] = newdata['akontocode']; // Assuming akontcode is a column name
          //   newdata['b_code'] = newdata['code']; // Assuming code is a column name


          //   const values = allData.map(rowData => tableColumns.map(column => newdata[column]));
          //   console.log(values+"values");
          //             await mysqlcon(sql, [values]);
          // }

          if (tableName === 'tbl_merchant_assign') {
            await mysqlcon(sql, extractedValue);


          } else {
            const values = allData.map(rowData => tableColumns.map(column => rowData[column]));


            console.log(values + "values");
            await mysqlcon(sql, [values]);
          }
        }
      }));

      res.send('File uploaded and data inserted into the database.');
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({
      message: 'Server Error',
      error,
    });
  }
};


// ```````````````````````````````````````````````


module.exports.updateProfile = async function (req, res) {

  // updateProfile: async function (req, res) {

  try {
    var request = req.body;

    const img = req.file;
    console.log(img.originalname + "img.originalname")

    console.log(req.user)
    console.log(request);
    if (request) {
      if (request.empid && request.gender && request.dob && request.doj && request.team && request.nationality) {
        var em = { email: request.email };
        var sql = "SELECT id FROM tbl_emp WHERE ?";
        var dbquery = await mysqlcon(sql, em);
        if (dbquery[0]) {
          var user_data = {
            empid: request.empid,
            gender: request.gender,
            dob: request.dob,
            doj: request.doj,
            team: request.team,
            image: img.originalname,

          };

          let result = await mysqlcon("UPDATE tbl_emp SET ? WHERE email = ?", [user_data, request.email]);
          if (!result) {
            res.status(201).json({
              status: false,
              message: "Error updating profile",
              data: [],
            });
          } else {
            res.status(200).json({
              status: true,
              message: "Profile updated successfully",
              data: result,
            });
          }
        } else {
          res.status(404).json({
            status: false,
            message: "User not found",
            data: [],
          });
        }
      } else {
        res.status(400).json({
          status: false,
          message: "Please provide all required fields: empid, gender, dob, doj, team, nationality",
          data: [],
        });
      }
    } else {
      res.status(400).json({
        status: false,
        message: "Please provide request body",
        data: [],
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: false, message: "Error updating profile.", data: [] });
  }
}


// module.exports.card = async (req, res) => {
//   try {


//     let { filter, to, from } = req.body;
//     console.log(req.body + "req.body");
//     console.log(to + "to");
//     console.log(from + "from");

//     let today = new Date().toISOString().split('T')[0]; // Get today's date
//     console.log(today);


//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
//     yesterdayFormatted = yesterday.toISOString().split('T')[0]

//     // console.log(yesterday);


//     let sql1;
//     let sql2;
//     let sql3;
//     let sql4;

//     if (filter == 1) {
//       //today
//       sql1 = `SELECT FORMAT(COALESCE(SUM(ammount),0), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1  AND DATE(created_on) = '${today}'`;
//       sql2 = `SELECT FORMAT(COALESCE(SUM(amount),0), 2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND DATE(created_on) ='${today}'`;
//       sql3 = `SELECT FORMAT(COALESCE(SUM(requestedAmount),0), 2) AS total_amount FROM tbl_settlement WHERE status = 1 AND   DATE(created_on) ='${today}'`;
//       //  sql4 = `SELECT FORMAT(COALESCE(SUM(ammount),0), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 5 AND  DATE(created_on) ='${today}'`
//       sql4 = `SELECT 
//       CONCAT(
         
//           FORMAT(
//               (
//                   SELECT COALESCE(SUM(payin_charges), 0) 
//                   FROM tbl_merchant_transaction 
//                   WHERE status = 1 AND DATE(created_on) = '${today}'
//               ) 
//               +
//               (
//                   SELECT COALESCE(SUM(charges), 0) 
//                   FROM tbl_settlement 
//                   WHERE status = 1 AND DATE(created_on) = '${today}'
//               )
//               +
//               (
//                   SELECT COALESCE(SUM(akonto_charge), 0) 
//                   FROM tbl_icici_payout_transaction_response_details 
//                   WHERE status = 'SUCCESS' AND DATE(created_on) = '${today}'
//               ),
//               2
//           )
//       ) AS total_amount;
  
// `;



//     }
//     else if (filter == 2) {
//       //weekly
//       sql1 = `SELECT FORMAT(COALESCE(SUM(ammount),0), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1 AND  DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
//       sql2 = `SELECT FORMAT(COALESCE(SUM(amount),0), 2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND   DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
//       sql3 = `SELECT FORMAT(COALESCE(SUM(requestedAmount),0), 2) AS total_amount FROM tbl_settlement WHERE status = 1   AND DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
//       // sql4 = `SELECT FORMAT(COALESCE(SUM(ammount),0), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 5 AND DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
//       sql4 = `SELECT 
//       CONCAT(
//           FORMAT(
//               (
//                   SELECT COALESCE(SUM(payin_charges), 0) 
//                   FROM tbl_merchant_transaction 
//                   WHERE status = 1 AND  DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
//               ) 
//               +
//               (
//                   SELECT COALESCE(SUM(charges), 0) 
//                   FROM tbl_settlement 
//                   WHERE status = 1 AND  DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
//               )
//               +
//               (
//                   SELECT COALESCE(SUM(akonto_charge), 0) 
//                   FROM tbl_icici_payout_transaction_response_details 
//                   WHERE status = 'SUCCESS' AND  DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
//               ),
//               2
//           )
//       ) AS total_amount;
//   `

//     }
//     else if (filter == 3) {
//       //month
//       sql1 = `SELECT FORMAT (COALESCE(SUM(ammount),0),2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1 AND  DATE(created_on) >=DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`;
//       sql2 = `SELECT FORMAT (COALESCE(SUM(amount),0),2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND  DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`;
//       sql3 = `SELECT FORMAT(COALESCE(SUM(requestedAmount),0), 2) AS total_amount FROM tbl_settlement WHERE status = 1   AND DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`;

//       sql4 = `SELECT 
//       CONCAT(
//           FORMAT(
//               (
//                   SELECT COALESCE(SUM(payin_charges), 0) 
//                   FROM tbl_merchant_transaction 
//                   WHERE status = 1 AND   DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
//               ) 
//               +
//               (
//                   SELECT COALESCE(SUM(charges), 0) 
//                   FROM tbl_settlement 
//                   WHERE status = 1 AND  DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
//               )
//               +
//               (
//                   SELECT COALESCE(SUM(akonto_charge), 0) 
//                   FROM tbl_icici_payout_transaction_response_details 
//                   WHERE status = 'SUCCESS' AND DATE(created_on) >=  DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
//               ),
//               2
//           )
//       ) AS total_amount;
//   `

//     }
//     else if (to != null && from != null) {
//       //to too from


//       sql1 =`SELECT FORMAT(COALESCE(SUM(ammount), 0), 2) AS total_amount  FROM tbl_merchant_transaction WHERE status = 1 AND DATE(created_on) >= '${to}' AND DATE(created_on) <= '${from}'`;

//       sql2 =` SELECT FORMAT (COALESCE(SUM(amount),0),2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS'  AND  DATE(created_on)>= '${to}' AND DATE (created_on)<= '${from}'`;
//       sql3 = `SELECT FORMAT (COALESCE(SUM(requestedAmount),0),2) AS total_amount FROM tbl_settlement WHERE status = 1  AND  DATE(created_on) >= '${to}' AND DATE   (created_on)<= '${from}'`;
//       sql4=`SELECT 
//       CONCAT(
//           FORMAT(
//               (
//                   SELECT COALESCE(SUM(payin_charges), 0) 
//                   FROM tbl_merchant_transaction 
//                   WHERE status = 1 AND  DATE(created_on) >= '${to}' AND DATE(created_on) <= '${from}'
//               ) 
//               +
//               (
//                   SELECT COALESCE(SUM(charges), 0) 
//                   FROM tbl_settlement 
//                   WHERE status = 1 AND DATE(created_on) >= '${to}' AND DATE(created_on) <= '${from}'              )
//               +
//               (
//                   SELECT COALESCE(SUM(akonto_charge), 0) 
//                   FROM tbl_icici_payout_transaction_response_details 
//                   WHERE status = 'SUCCESS' AND DATE(created_on) >= '${to}' AND DATE(created_on) <= '${from}'
//               ),
//               2
//           )
//       ) AS total_amount`;
   
//     }

//     else {
//       //yesterday
//       sql1 = `SELECT FORMAT(COALESCE(SUM(ammount), 0),2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1 AND   DATE(created_on) = '${yesterdayFormatted}'`;
//       sql2 = `SELECT FORMAT(COALESCE(SUM(amount),0), 2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND  DATE(created_on) ='${yesterdayFormatted}'`;
//       sql3 = `SELECT FORMAT(COALESCE(SUM(requestedAmount),0), 2) AS total_amount FROM tbl_settlement WHERE status = 1 AND DATE(created_on) ='${yesterdayFormatted}'`;

// sql4=`SELECT 
// CONCAT(
    
//     FORMAT(
//         (
//             SELECT COALESCE(SUM(payin_charges), 0) 
//             FROM tbl_merchant_transaction 
//             WHERE status = 1 AND DATE(created_on) = '${yesterdayFormatted}'
//         ) 
//         +
//         (
//             SELECT COALESCE(SUM(charges), 0) 
//             FROM tbl_settlement 
//             WHERE status = 1 AND DATE(created_on) = '${yesterdayFormatted}'
//         )
//         +
//         (
//             SELECT COALESCE(SUM(akonto_charge), 0) 
//             FROM tbl_icici_payout_transaction_response_details 
//             WHERE status = 'SUCCESS' AND DATE(created_on) = '${yesterdayFormatted}'
//         ),
//         2
//     )
// ) AS total_amount;
// `


//     }

//     const result1 = await mysqlcon(sql1);
//     const result2 = await mysqlcon(sql2);
//     const result3 = await mysqlcon(sql3);
//     const result4 = await mysqlcon(sql4)


//     // const amount1 = result1 ? result1 : 0;
//     // const amount2 = result2 ? result2 : 0;
//     // const amount3 = result3 ? result3 : 0;
//     // const amount4 = result4 ? result4 : 0;



//     if (result1 && result2 && result3 && result4) {
//       return res.status(200).json({


//         message: "Amount Fetch Successfully ",
//         Deposite: result1[0].total_amount,
//         Payouts: result2[0].total_amount,
//         Settlements: result3[0].total_amount,
//         Commission: result4[0].total_amount,
//       })
//     }
//     else {
//       return res.status(400).json({
//         "message": "Error while fetching data"
//       })
//     }

//   } catch (err) {
//     console.log(err);
//     return res.status(404).json({
//       message: err,
//     })
//   }
// }



///////////////////////JWT TOKEN ////////////////////////



// Function to generate secret key based on token part

// module.exports.generateSecretKey = async (req, res) => {
//   // function generateSecretKey(token, part) {

//   const token=req.body;
//     try {
// console.log(req.body.token+"req.body.token")

//         // Decode the JWT token without verification to access the parts
//         const decodedToken = jwT.decode(req.body.token);
//         console.log(decodedToken+"decodedToken")

//         if (!decodedToken) {
//             throw new Error('Invalid token');
//         }

//         let targetPart;
//         if (part === 'header') {
//             targetPart = decodedToken.header;
//         } else if (part === 'payload') {
//             targetPart = decodedToken.payload;
//         } else {
//             throw new Error('Invalid part specified. Use "header" or "payload".');
//         }

//         // Convert the part to a JSON string
//         const targetPartJson = JSON.stringify(targetPart);

//         // Generate a secret key based on the JSON string using SHA-256 hash
//         const secretKey = crypto.createHash('sha256').update(targetPartJson).digest('hex');

//         return secretKey;
//     } catch (error) {
//         console.error('Error generating secret key:', error.message);
//         return null;
//     }
// }

// Example usage:
// const token = 'your_jwt_token_here';
// const partToUse = 'payload'; // Specify 'header' or 'payload'

// const secretKey = generateSecretKey(token, partToUse);
// if (secretKey) {
//     console.log(`Generated secret key based on ${partToUse}: ${secretKey}`);
// }



// Function to generate a signed JWT using header, payload, and secret key


module.exports.generateSignature = async (req, res) => {
  try {
    const header = {
      "alg": "HS256",
      "clientid": "uatyeppev2"
    };

    const payload = {
      "mercid": "UATYEPPEV2",
      "orderid": "Billdesk1713438625",
      "amount": "300.00",
      "order_date": "2024-04-18T16:40:25+05:30",
      "currency": "356",
      "ru": "https://www.google.com/",
      "itemcode": "DIRECT",
      "device": {
        "ip": "103.153.58.59",
        "init_channel": "internet",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:51.0) Gecko/20100101 Firefox/51.0"
      }
    };

    let x = typeof (payload);
    console.log(x);

    const secretKey = 'WP2C5oLaKvFOWvmRUvkWDdXytF27LwbI';

    // Generate signature using JWT
    const signature = jwt.sign(payload, secretKey, {
      algorithm: 'HS256',
      header: header

    });

    if (signature) {

      console.log('Generated Signature:', signature);
      return res.status(400).json({
        "message": " fetching Signature",
        "signature": signature
      })
    } else {
      console.log(' NOT Generated Signature:', signature);
      return res.status(400).json({
        "message": " error while fetching Signature",
        "signature": null

      })
    }
  } catch (error) {
    console.log(err);
    return res.status(404).json({
      message: error,
    })
  }
};


// Example usage:
// const header = {
//     alg: 'HS256',
//     typ: 'JWT'
// };

// const payload = {
//     userId: '123456',
//     username: 'example_user'
// };

// const secretKey = 'your_secret_key_here';

// const signedJWT = generateSignedJWT(header, payload, secretKey);
// if (signedJWT) {
//     console.log('Generated Signed JWT:', signedJWT);
// } else {
//     console.log('Failed to generate signed JWT.');
// }

// module.exports.card = async (req, res) => {
//     try {


//      let {todayDay,yesterdayDay,weeklyday,monthly,to,from}=req.body;
//      console.log(req.body+"req.body");
//      console.log(to+"to");
//      console.log(from+"from");

//         let today = new Date().toISOString().split('T')[0]; // Get today's date
//         console.log(today);


//         const yesterday = new Date();
//         yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
//          yesterdayFormatted = yesterday.toISOString().split('T')[0]

// // console.log(yesterday);


// let sql1;
// let sql2;
// let sql3;
// let sql4;



//      if(yesterdayDay==1){



//          sql1 = SELECT FORMAT(SUM(ammount), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND DATE(created_on) = '${yesterdayFormatted}';
//          sql2 = SELECT FORMAT(SUM(amount), 2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND  DATE(created_on) ='${yesterdayFormatted}';
//          sql3 = SELECT FORMAT(SUM(requestedAmount), 2) AS total_amount FROM tbl_settlement WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)  AND  DATE(created_on) ='${yesterdayFormatted}';
//          sql4 = SELECT FORMAT(SUM(ammount), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 5 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)  AND DATE(created_on) ='${yesterdayFormatted}'

//     }else if(todayDay==2){

//          sql1 = SELECT FORMAT(SUM(ammount), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND DATE(created_on) = '${today}';
//          sql2 = SELECT FORMAT(SUM(amount), 2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)  AND DATE(created_on) ='${today}';
//          sql3 = SELECT FORMAT(SUM(requestedAmount), 2) AS total_amount FROM tbl_settlement WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)  AND  DATE(created_on) ='${today}';
//          sql4 = SELECT FORMAT(SUM(ammount), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 5 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND  DATE(created_on) ='${today}'
//     }
//     else if(weeklyday==3){

//         sql1 = SELECT FORMAT(SUM(ammount), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
//         sql2 = SELECT FORMAT(SUM(amount), 2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)  AND DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
//         sql3 = SELECT FORMAT(SUM(requestedAmount), 2) AS total_amount FROM tbl_settlement WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)  AND DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
//         sql4 = SELECT FORMAT(SUM(ammount), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 5 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
//     }
//     else if(monthly==4){

//         sql1 = SELECT FORMAT (SUM(ammount),2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND  DATE(created_on) >=DATE_SUB(CURDATE(), INTERVAL 1 MONTH);
//          sql2 = SELECT FORMAT (SUM(amount),2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH);
//          sql3 = SELECT FORMAT (SUM(requestedAmount),2) AS total_amount FROM tbl_settlement WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH);
//          sql4 = SELECT FORMAT (SUM(ammount),2) AS total_amount FROM tbl_merchant_transaction WHERE status = 5 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH);
//       }
//       else if(to!=null && from!=null){

//         console.log(to+"to");
//         console.log(from+"from");

//         sql1 = SELECT FORMAT(SUM(ammount), 2) AS total_amount   FROM tbl_merchant_transaction  WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)  AND DATE(created_on) BETWEEN DATE_SUB('${to}', INTERVAL ${from} DAY) AND '${to}';
//          sql2 = SELECT FORMAT (SUM(amount),2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND DATE(created_on) BETWEEN DATE_SUB('${to}', INTERVAL  ${from} DAY) AND '${to}';
//          sql3 = SELECT FORMAT (SUM(requestedAmount),2) AS total_amount FROM tbl_settlement WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND DATE(created_on) AND DATE(created_on) BETWEEN DATE_SUB('${to}', INTERVAL ${from} DAY) AND '${to}';
//          sql4 = SELECT FORMAT (SUM(ammount),2) AS total_amount FROM tbl_merchant_transaction WHERE status = 5 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND DATE(created_on) BETWEEN DATE_SUB('${to}', INTERVAL ${from} DAY) AND '${to}';
//       }

//     else{
//          sql1 = "SELECT FORMAT (SUM(ammount),2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)"
//          sql2 = "SELECT FORMAT (SUM(amount),2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)"
//          sql3 ="SELECT FORMAT (SUM(requestedAmount),2) AS total_amount FROM tbl_settlement WHERE status = 1 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)"
//          sql4 = "SELECT FORMAT (SUM(ammount),2) AS total_amount FROM tbl_merchant_transaction WHERE status = 5 AND created_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)"
//     }

//         const result1 = await mysqlcon(sql1);
//         const result2 = await mysqlcon(sql2);
//         const result3 = await mysqlcon(sql3);
//         const result4 = await mysqlcon(sql4)

//         if (result1  && result2 && result3 && result4) {
//             return res.status(200).json({
//                 message: "DATA Fetch Successfully",
//                 Deposite: result1,
//                 Payouts: result2,
//                 Settlements: result3,
//                 Commission: result4
//             })
//         }
//         else {
//             return res.status(400).json({
//                 "message": "Error while fetching data"
//             })
//         }

//     } catch (err) {
//         console.log(err);
//         return res.status(404).json({
//             message: err,
//         })
//     }
// }


module.exports.decodeToken = async (req, res) => {

  // function decodeToken(token) {
  try {

    const token = "eyJhbGciOiJIUzI1NiIsImNsaWVudGlkIjoidWF0eWVwcGV2MiIsImtpZCI6IkhNQUMifQ.eyJvYmplY3RpZCI6Im9yZGVyIiwib3JkZXJpZCI6IjYyY2UzMDNkNzY1ZjU5MWQzRCIsImJkb3JkZXJpZCI6Ik9BTjcxOVhUU0tSTkdQIiwibWVyY2lkIjoiVUFUWUVQUEVWMiIsIm9yZGVyX2RhdGUiOiIyMDI0LTA0LTIyVDEyOjU1OjMwKzA1OjMwIiwiYW1vdW50IjoiMzAzLjc0IiwiY3VycmVuY3kiOiIzNTYiLCJydSI6Imh0dHBzOi8vcGF5b3dheS5jb20vd2ViL2JhbmtwYXkvQmFua3BheS9yZXR1cm5iaWxsdXJsIiwiYWRkaXRpb25hbF9pbmZvIjp7ImFkZGl0aW9uYWxfaW5mbzEiOiJOQSIsImFkZGl0aW9uYWxfaW5mbzIiOiJOQSIsImFkZGl0aW9uYWxfaW5mbzMiOiJOQSIsImFkZGl0aW9uYWxfaW5mbzQiOiJOQSIsImFkZGl0aW9uYWxfaW5mbzUiOiJOQSIsImFkZGl0aW9uYWxfaW5mbzYiOiJOQSIsImFkZGl0aW9uYWxfaW5mbzciOiJOQSIsImFkZGl0aW9uYWxfaW5mbzgiOiJOQSIsImFkZGl0aW9uYWxfaW5mbzkiOiJOQSIsImFkZGl0aW9uYWxfaW5mbzEwIjoiTkEifSwiaXRlbWNvZGUiOiJESVJFQ1QiLCJjcmVhdGVkb24iOiIyMDI0LTA0LTIyVDEyOjU1OjMyKzA1OjMwIiwibmV4dF9zdGVwIjoicmVkaXJlY3QiLCJsaW5rcyI6W3siaHJlZiI6Imh0dHBzOi8vd3d3LmJpbGxkZXNrLmNvbS9wZ2kvdmUxXzIvb3JkZXJzLzYyY2UzMDNkNzY1ZjU5MWQzRCIsInJlbCI6InNlbGYiLCJtZXRob2QiOiJHRVQifSx7ImhyZWYiOiJodHRwczovL3VhdDEuYmlsbGRlc2suY29tL3UyL3dlYi92MV8yL2VtYmVkZGVkc2RrIiwicmVsIjoicmVkaXJlY3QiLCJtZXRob2QiOiJQT1NUIiwicGFyYW1ldGVycyI6eyJtZXJjaWQiOiJVQVRZRVBQRVYyIiwiYmRvcmRlcmlkIjoiT0FONzE5WFRTS1JOR1AiLCJyZGF0YSI6ImM1NTQzMDA2ODg3OGI1OGNkNTlmMDE5NTY2MGI1NzJmYmNlYjZkZTYwMjhiMzYxMjExNzJmODc5NjQyZGI1MDEyYzZiMDljODg3ZWFhMGVhM2ZiZDMwMjQwYjY3Zjg2ZmY4ZDY1ZDZjYTQ3ZTY0MzZjNzUwMTEyNGJiMGIxNzIzMzAuNzU2MTc0NmI2NTc5MzEifSwidmFsaWRfZGF0ZSI6IjIwMjQtMDQtMjJUMTM6MjU6MzIrMDU6MzAiLCJoZWFkZXJzIjp7ImF1dGhvcml6YXRpb24iOiJPVG9rZW4gMzVjZWM5OWMwYzFhNTdmNjAzZDc5ZjNjNTAzOWE2YjlmZTU2NTdlMGIxYzQ3MGYwNzk1ZDU1OWZlNzUxMjQ0ZGM4NTg5Y2IxMjRlYjU3Y2JjYThmMmM3YzRkOTU4MGRmYjI3MTYyMjgyMWY3YmIwM2QwMTJiMjIwYzk2YWM5MTcxNGFiMjkyMjY2NTgzYjNkYTRhZWY2MDZjM2JkY2E0Y2UyNGM3YjgyMGRmMTQ0ZWUzOTI2ZDY0YTZhZDRjYjc0NGMxNTJkNGRiMzQxYzkzMDFiNmMyNDg4YTI5NjcyZjZiOGYxYTg5MTIyMGRkNDRlOGI4NDVjMThiOTc2ODVhYTJiMGNiMmU4NTNmMDEyZGIzZTkwNGU4MWU3YTY5MjExNzg4MGFjZDcxZjE3ZmI3MDc0ZTdkYy40MTQ1NTM1ZjU1NDE1NDMxIn19XSwic3RhdHVzIjoiQUNUSVZFIn0.qLDYfJbdwPnCxZK7ZPJZnm7UDFonIGZHeYKAfMtf2VE";
    const tokenParts = token.split('.');
    const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString('utf-8'));
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));

    if (header && payload) {

      console.log('hedaer:', header);
      return res.status(400).json({
        "message": "Decode Token",
        "header": header,
        "payload": payload,

      })
    } else {
      console.log(' NOT Generated Signature:', header);
      return res.status(400).json({
        "message": " error while fetching Signature",
        "header": null,
        "payload": null


      })
    }

  } catch (error) {
    console.error('Token decoding error:', error);
    return null; // Handle decoding error gracefully
  }
}

// Example usage:


// module.exports.card = async (req, res) => {
//   try {
//     const { filter, to, from } = req.body;

//     let startDate, endDate;

//     if (filter == 1) {
//       // Today
//       startDate = endDate = new Date().toISOString().split('T')[0];
//     } else if (filter == 2) {
//       // Past week
//       startDate = new Date();
//       startDate.setDate(startDate.getDate() - 6); // Start date of the past week (last 7 days)
//       startDate = startDate.toISOString().split('T')[0];
//       endDate = new Date().toISOString().split('T')[0];
//     } else if (filter == 3) {
//       // Past month
//       startDate = new Date();
//       startDate.setMonth(startDate.getMonth() - 1); // Start date of the past month
//       startDate = startDate.toISOString().split('T')[0];
//       endDate = new Date().toISOString().split('T')[0];
//     } else if (to && from) {
//       // Custom date range provided
//       startDate = to;
//       endDate = from;
//     } else {
//       // Default to yesterday
//       startDate = endDate = new Date();
//       startDate.setDate(startDate.getDate() - 1);
//       startDate = endDate = startDate.toISOString().split('T')[0];
//     }

//     const queries = [
//       `SELECT FORMAT(COALESCE(SUM(ammount), 0), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1 AND DATE(created_on) >= '${startDate}' AND DATE(created_on) <= '${endDate}'`,
      
//       `SELECT FORMAT(COALESCE(SUM(amount), 0), 2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND DATE(created_on) >= '${startDate}' AND DATE(created_on) <= '${endDate}'`,
     
//       `SELECT FORMAT(COALESCE(SUM(requestedAmount), 0), 2) AS total_amount FROM tbl_settlement WHERE status = 1 AND DATE(created_on) >= '${startDate}' AND DATE(created_on) <= '${endDate}'`,
     
//       `SELECT CONCAT(FORMAT((SELECT COALESCE(SUM(payin_charges), 0) FROM tbl_merchant_transaction WHERE status = 1 AND DATE(created_on) >= '${startDate}' AND DATE(created_on) <= '${endDate}') + (SELECT COALESCE(SUM(charges), 0) FROM tbl_settlement WHERE status = 1 AND DATE(created_on) >= '${startDate}' AND DATE(created_on) <= '${endDate}') + (SELECT COALESCE(SUM(akonto_charge), 0) FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND DATE(created_on) >= '${startDate}' AND DATE(created_on) <= '${endDate}'), 2)) AS total_amount`


      
   
    
    
//     ];

//     const [result1, result2, result3,result4] = await Promise.all(queries.map(sql => mysqlcon(sql)));

//     if (result1 && result2 && result3 && result4) {
//       return res.status(200).json({
//         message: "Amounts fetched successfully",
//         Deposits: result1[0].total_amount,
//         Payouts: result2[0].total_amount,
//         Settlements: result3[0].total_amount,
//         Commission: result4[0].total_amount
//       });
//     } else {
//       return res.status(400).json({
//         message: "Error while fetching data"
        
//       });
//     }

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       message: "Internal server error"
//     });
//   }
// }

module.exports.card = async (req, res) => {
  try {
    const { filter, to, from } = req.body;

    let dateCondition = '';

    if (filter == 1) {
      // Today
      dateCondition = `DATE(created_on) = CURDATE()`;
    } else if (filter == 2) {
      // Past week
      dateCondition = `DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`;
    } else if (filter == 3) {
      // Past month
      dateCondition = `DATE(created_on) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`;
    } else if (to && from) {
      // Custom date range provided
      dateCondition = `DATE(created_on) >= '${to}' AND DATE(created_on) <= '${from}'`;
    } else {
      // Default to yesterday
      dateCondition = `DATE(created_on) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
    }

    const queries = [
      `SELECT FORMAT(COALESCE(SUM(ammount), 0), 2) AS total_amount FROM tbl_merchant_transaction WHERE status = 1 AND ${dateCondition}`,
      `SELECT FORMAT(COALESCE(SUM(amount), 0), 2) AS total_amount FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND ${dateCondition}`,
      `SELECT FORMAT(COALESCE(SUM(requestedAmount), 0), 2) AS total_amount FROM tbl_settlement WHERE status = 1 AND ${dateCondition}`,
      `SELECT CONCAT(FORMAT((SELECT COALESCE(SUM(payin_charges), 0) FROM tbl_merchant_transaction WHERE status = 1 AND ${dateCondition}) + (SELECT COALESCE(SUM(charges), 0) FROM tbl_settlement WHERE status = 1 AND ${dateCondition}) + (SELECT COALESCE(SUM(akonto_charge), 0) FROM tbl_icici_payout_transaction_response_details WHERE status = 'SUCCESS' AND ${dateCondition}), 2)) AS total_amount`
    ];

    const results = await Promise.all(queries.map(sql => mysqlcon(sql)));

    if (results.every(result => result && result[0])) {
      return res.status(200).json({
        message: "Amounts fetched successfully",
        Deposits: results[0][0].total_amount,
        Payouts: results[1][0].total_amount,
        Settlements: results[2][0].total_amount,
        Commission: results[3][0].total_amount
      });
    } else {
      return res.status(400).json({
        message: "Error while fetching data"
      });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

module.exports.streamApi=async (req, res)=>{
// create a stream api for memory comsubtion is less
 const stream =fs.createReadStream("./sample.txt","utf-8");
stream.on("data",(chunk)=>res.write(chunk));
stream.on("end",()=>res.end());


}



module.exports.zipFileThrowStreaming=async (req, res)=>{
  // create a stream for zip  file and (write sample.txt file data into a data in a zip file) 
   const stream =fs.createReadStream("./sample.txt").pipe(zlib.createGzip().pipe(fs.createWriteStream("./sampleZipFile.zip")));
  //  stream.on("end",()=>res.end());

  
  
  }
  

//   async uploadDocument(req, res){
//     // console.log("req.body",req.body)
//     console.log("req.body",req.user.id)

//     const id = req.user.id;
    
//     const email = req.user.email;
//     let filterType = req.body.filterType ? Number(req.body.filterType) : 1 ; req.body.filterType ? Number(req.body.filterType) : 2 ;req.body.filterType ? Number(req.body.filterType) : 3 ;req.body.filterType ? Number(req.body.filterType) : 4 ; req.body.filterType ? Number(req.body.filterType) : '';
//     console.log(req.body.filterType)
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: "kr.manjeet319@gmail.com",
//         pass: "mfvadlyccsgukabu",
//       }
//     });
  
//     const mailOptions = {
//       from: "kr.manjeet319@gmail.com",
//       to: email,
//       subject: 'Send Attachament',
//       html: '<h1>Hello, This is Attachanment !!</h1><p>This is test mail..!</p>',
//       attachments: [
//         {
//           filename: req.files.image[0].originalname, 
//           path : filepath+"/"+ req.files.image[0].originalname
//         },
//         {
//           filename: req.files.image1[0].originalname, 
//           path : filepath+"/"+ req.files.image1[0].originalname
//         },
//         {
//           filename: req.files.image2[0].originalname, 
//           path :  filepath +"/"+ req.files.image2[0].originalname
//         },
//         {
//           filename: req.files.image3[0].originalname, 
//           path :  filepath +"/"+ req.files.image3[0].originalname
//         }
//       ]
//     }
    
//     var llp = {
//       merchant_id : id,
//       llp_business_identity : req.files.image[0].originalname,
//       llp_business_existence : req.files.image1[0].originalname,
//       llp_business_owners : req.files.image2[0].originalname,
//       llp_business_working : req.files.image3[0].originalname,
//     }
    
//     let prtnr = {
//       merchant_id : id,
//       prtnr_business_identity : req.files.image[0].originalname,	
//       prtnr_business_existence : req.files.image1[0].originalname,
//       prtnr_business_working : req.files.image2[0].originalname,
//       prtnr_business_owners : req.files.image3[0].originalname
//     }
  
//     let sole = {
//       merchant_id : id,
//       sole_business_identity : req.files.image[0].originalname,	
//       sole_business_existence : req.files.image1[0].originalname,
//       sole_business_working : req.files.image2[0].originalname,
//       sole_business_owners : req.files.image3[0].originalname
//     }
  
//     let ngo =  {
//       merchant_id : id,
//       ngo_business_identity : req.files.image[0].originalname ,
//       ngo_business_existence : req.files.image1[0].originalname,	
//       ngo_business_working : req.files.image2[0].originalname,
//       ngo_business_owners : req.files.image3[0].originalname
//     }
//     let setNull = {
//       llp_business_identity : null,
//       llp_business_existence : null,
//       llp_business_owners : null,
//       llp_business_working : null,
//       prtnr_business_identity : null,	
//       prtnr_business_existence : null,
//       prtnr_business_working : null,
//       prtnr_business_owners : null,
//       sole_business_identity : null,	
//       sole_business_existence : null,
//       sole_business_working : null,
//       sole_business_owners : null,
//       ngo_business_identity : null,
//       ngo_business_existence : null,	
//       ngo_business_working : null,
//       ngo_business_owners : null
//     }
//     try {
//       let sql = "SELECT kyc_type from tbl_user WHERE id = ?";
//       let result = await mysqlcon(sql,[id])
//       console.log(result,"result");
//       console.log(result.kyc_type,"oooooooo");
//       let test = result[0].kyc_type

//       if(test != 0){    
// let doc1 = ${test}+"_business_identity"
// let doc2 = ${test}+"_business_existence"
// let doc3 = ${test}+"_business_owners"
// let doc4 = ${test}+"_business_working"

// let selectDocSql = SELECT ${doc1},${doc2},${doc3},${doc4} from kyc_document WHERE merchant_id = ?;
// let selectDocResult = await mysqlcon(selectDocSql,[id])
// let values = selectDocResult.map(doc => Object.values(doc));
// console.log(values[0])

// values.map((item)=>{
//   if (fs.existsSync(${filepath}/${item})) {
//     fs.unlinkSync(${filepath}/${item});
//   } else {
//     console.error(File ${item} does not exist.);
//   }
// })
//         let setNullSql = "UPDATE kyc_document SET ?,created_on = now(),modified_on = now() WHERE merchant_id = ?";
//         let result = await mysqlcon(setNullSql,[setNull,id])
//         let setKycTypeSql = "UPDATE tbl_user SET kyc_type=? WHERE id = ?"
//         var insertSql = "UPDATE kyc_document SET ?, created_on = now(), modified_on = now() WHERE merchant_id = ?"


//         if(filterType == 1){
//           let result = await mysqlcon(insertSql,[llp, id])
//           let results = await mysqlcon(setKycTypeSql,["llp",id])
//         }else if(filterType == 2){
//           let result = await mysqlcon(insertSql,[prtnr, id])
//           let results = await mysqlcon(setKycTypeSql,["prtnr",id])
//         }else if(filterType == 3){
//           let result = await mysqlcon(insertSql,[sole, id])
//           let results = await mysqlcon(setKycTypeSql,["sole",id]) 
//         }else if(filterType == 4){
//           let result = await mysqlcon(insertSql,[ngo, id])
//           let results = await mysqlcon(setKycTypeSql,["ngo",id])
//         }
//         transporter.sendMail(mailOptions, function(error, info){
//           if (error){
//             console.log(error)
//             res.status(200).json({
//               message : "error",
//             })
//           } else {
//             res.status(200).json({
//               message : "Documents Uploaded",
//             });
//           }
//         });
//       } else {
//         let sql = "INSERT INTO kyc_document SET ?, created_on = now(), modified_on = now()"
//         let userSql = "UPDATE tbl_user SET kyc_type = ? WHERE id = ?"
//         if(filterType === 1){
//         let result = await mysqlcon(sql,[llp])
//         let result1 = await mysqlcon(userSql, ["llp",id])
//         transporter.sendMail(mailOptions, function(error, info){
//           if (error){
//             console.log(error)
//             res.status(200).json({
//               message : "error",
//             })
//           } else {
//             res.status(200).json({
//               message : "Documents Uploaded",
//               result1
//             });
//           }
//         });

//         }else if(filterType === 2){
//         let result = await mysqlcon(sql,[prtnr])
//         let result1 = await mysqlcon(userSql, ["prtnr",id])     
//         transporter.sendMail(mailOptions, function(error, info){
//           if (error){
//             console.log(error)
//             res.status(200).json({
//               message : "error",
//             })
//           } else {
//             res.status(200).json({
//               message : "Documents Uploaded",
//             });
//           }
//         });

//         }else if(filterType === 3){
//         let result = await mysqlcon(sql,[sole])
//         let result1 = await mysqlcon(userSql, ["sole",id])
//         transporter.sendMail(mailOptions, function(error, info){
//           if (error){
//             console.log(error)
//             res.status(200).json({
//               message : "error",
//             })
//           } else {
//             res.status(200).json({
//               message : "Documents Uploaded",
//             });
//           }
//         });
        
//         }else if(filterType === 4){
//           let result = await mysqlcon(sql,[ngo])
//           let result1 = await mysqlcon(userSql, ["ngo",id])
              
//             transporter.sendMail(mailOptions, function(error, info){
//             if (error){
//               console.log(error)
//               res.status(200).json({
//                 message : "error",
//               })
//             } else {
//               res.status(200).json({
//                 message : "Documents Uploaded",
//               });
//             }
//           });
//         }
//       }
//     } catch (error) {
//       console.log(error)
//       return res.json(500,{
//         message : 'error',
//         error :error
//       })
//     }
//   }



module.exports.loginSession = async (req, res) => {

  try {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    var results = await mysqlcon(sql, email);
    // if (err) {
    //   res.status(500).send('Error logging in');
    //   return;
    // }
    if (results.length === 0) {
      res.status(400).send('User not found');
      return;
    }
    const user = results[0];
    // console.log(user);
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.user = user;
      // console.log(req.session.user);

      res.status(200).send('Login successful');
    } else {
      res.status(400).send('Incorrect password');
    }
  }
 catch (err) {
    console.log(err);
    return res.status(201).json({ error: err });
  }

}


// Register a new user
module.exports.registerUser = async (req, res) => {
  try{

    const data= req.body;
    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log(hashedPassword,"hashedPassword");
    var user_data = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
     
    };
  
    sql = "INSERT INTO users SET ?";
    var response = await mysqlcon(sql, [user_data]);
    console.log(response,"response");
      if (response) {
   
        res.status(201).send(`User registered with ID: ${response.insertId}`);
        return;
      }
      res.status(500).send('Error registering user');
    
  }catch(err){
    console.log(err);
    return res.status(201).json({ error: err });
  }}

