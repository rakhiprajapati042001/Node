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
const Excel = require('exceljs');
const pdfDoc = require('pdfkit');
const fs = require('fs');
const xlsx = require('xlsx');

dotenv.config();

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


module.exports.pdfDownload = async function (req, res) {
  
  try{
    let sql = "SELECT * FROM module"
     let dataSet = await mysqlcon(sql);

  const doc = new pdfDoc();


  dataSet.forEach((row) => {
    doc.text(JSON.stringify(row));
  });

    const filePath = 'data.pdf';

  const outputStream = fs.createWriteStream(filePath);
  console.log(outputStream+"outputStream");
  doc.pipe(outputStream)
  // Finalize the PDF document
  doc.end();
  console.log('PDF created successfully');

  res.download(filePath, 'data.pdf', (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    })

  }catch(error){
    console.log(error);
    res.status(500)
      .json({ status: false, message: "Error to complete task."});
  }


}

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

      for(i = 0;i<details.length;i++){
              // console.log(details[i].id);
              // console.log(details[i].name);
      }
  
      for (let num = 0; num < details.length; num++) {
          const submenuSql = `SELECT id,name,image,description FROM module WHERE parent_menu_id = ${details[num].id}`;
          const submenus = await mysqlcon(submenuSql);
          let data2=[]

          submenus.forEach(submenu => {
              data2.push({
                  id:submenu.id,
                  name:submenu.name,
                  description:submenu.description,
                  image:submenu.image
              });
          });

          data1.push({
              id: details[num].id,
              name: details[num].name,
              description:details[num].description,
              images:details[num].image,

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



module.exports.importExcelSheet=async (req,res)=>{

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }


  const workbook = xlsx.readFile(req.file.path);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  console.log(Object.values(worksheet)+"worksheet");
  const data = xlsx.utils.sheet_to_json(worksheet);
  console.log(data+"dara");
  // Insert data into the database
  data.forEach(row => {


    // Handle blank values and set default values
  const name = row.name || ''; // If name is blank, set it to an empty string
  const parent_menu_id = row.parent_menu_id || 0; // If parent_menu_id is blank, set it to 0
  const status = row.status == '' ? null : row.status;
    console.log(row+"youuuu");
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
module.exports.vendors=async (req,res)=>{

  try{
  
  
      const sql1 =  `SELECT 
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
     
      if (deposit && payout ) {
          return res.status(200).json({
              message: "Data Fetched Successfully",
              Deposite: deposit,
              Payout:payout
             
          });
  
      } else{
          return res.status(400).json({
              "message": "Error while fetching data"
          })
      
      }
  
  }catch(err){
      console.log(err);
      return res.status(201).json({ error: err }); 
  }
  
  
  
}  



module.exports.vendorConnection = async function(req,res) {
  try{
    let sqlquery = `SELECT ROUND(SUM(ammount)) AS total_amount,payment_gateway.gateway_name FROM tbl_merchant_transaction LEFT JOIN payment_gateway ON tbl_merchant_transaction.gatewayNumber = payment_gateway.id WHERE tbl_merchant_transaction.status = 1 AND tbl_merchant_transaction.created_on >= NOW() - INTERVAL 6 MONTH GROUP BY tbl_merchant_transaction.gatewayNumber LIMIT 10`;
    
    const result = await mysqlcon(sqlquery);

    let allTotalAmounts = '';
    let allGatewayName  = '';
    for (let i = 0; i < result.length; i++) {
      allTotalAmounts += result[i].total_amount + ', ';
    }
    for(let j = 0;j<result.length; j++){
      allGatewayName += result[j].gateway_name+', '
    }

  //   console.log(allTotalAmounts);
  //   console.log(allGatewayName);
    
    if(result){
      return res.status(200).json({ message:'Top 10 vendors Data fetched successfully',
      DEPOSITE_AMOUNT:allTotalAmounts,GATEWAY_NAME:allGatewayName})
    }
    else{
      return res.status(201).json({ message:'Unable to fetch data'})
    }
  }catch(err){
      return res.status(404).json({ err:'Error occured'+err})
  }
}  



module.exports.csv=async (req,res)=>{

 try{

  
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const workbook = xlsx.readFile(req.file.path);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  console.log(Object.values(worksheet)+"worksheet");
  const data = xlsx.utils.sheet_to_json(worksheet);
  // Insert data into the database
  data.forEach(row => {

console.log(row.akontocode);
    const sql = 'INSERT INTO tbl_code (type, title,status,code,akontocode,payment_gate,bank_services_charge) VALUES (?,?,?,?,?,?,?)'; // Modify as per your table structure
    const values = [row.type,row.title,row.status,row.code,row.akontocode,row.payment_gate,row.bank_services_charge]; // Adjust according to your Excel columns
    console.log(row.akontocode);

    mysqlcon(sql, values, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return;
      }
      console.log('Data inserted successfully:', result);
    });

     const sql2 = 'INSERT INTO tbl_akonto_banks_code(type, title, status,code,currencies) VALUES (?, ?, ?,?,?)'; // Modify as per your table structure
    const values2 = [row.type,row.title, row.status,row.code,row.akontocode,row.payment_gate,row.bank_services_charge]; // Adjust according to your Excel columns
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
 }catch(err)
 {
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