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




