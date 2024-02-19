const route=require("express").Router();
const loginController=require("../Controller/signUp");
const authMiddleware=require('../configuration/middleware/authMiddleware')


const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../images');
  },
  filename: function (req, file, cb) {
    let imgname = new Date().toString();
    imgname = imgname.replace(/ |:|\+|\(|\)/gi, "-");
    let imgext  =file.image;
    let image = `${imgname}${imgext}`;
    cb(null, image);
  },


}
);



/**
 * @swagger
 * /getModule :
 *             post:
 *                  summary:this is a summary of this api
 *                  description:this is a summary of this api
 *                  response:
 *                         200:
 *                             description: to test get method
 *                      
 * 
 * 
 * 
 */


const uploads = multer({ storage: storage });
console.log(storage+"storage");

console.log(uploads+"uploads");
route.post("/signUP", loginController.signUP);
route.post("/login", loginController.login);

route.post("/login",authMiddleware, loginController.createUserProfile);
route.post("/changePassword",authMiddleware, loginController.changePassword);
route.post("/sendOtp", loginController.sendOtp);
route.post("/forgetPassword", loginController.forgetPassword);
route.post("/sendSMS", loginController.SMS);
route.post("/twilio", loginController.twilio);
route.post("/addModule",uploads.single("image"), loginController.addModule);
route.post("/updateModuled",uploads.single("image"), loginController.updateModuled);

route.post("/getModule", loginController.getModule);
route.post("/deleteModule", loginController.deleteModule);
route.post("/getSubModule", loginController.getSubModule);
route.post("/excelExport", loginController.excelExport);

route.post("/pdfDownload", loginController.pdfDownload);







module.exports=route;