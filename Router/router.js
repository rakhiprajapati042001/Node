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





const uploads = multer({ storage: storage });



/**
 * 
*components:
*     schemas:
*          ExampleResponse:
*            type: object
*            properties:
*                 message:
*                     type: string
*                     description: Message indicating the success of the request.
*          example:
*               message: Send Successfully
*/



/**
 * @swagger
 * /example:
 *            get:     
 *               responses:
 *                       200:
 *                       description: Successful response
 *                       content:
 *                               application/json:
 *                               schema:
 *                                    $ref: '#/components/schemas/ExampleResponse'     
 */

route.get("/example", loginController.example);

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

route.post("/get_menu", loginController.get_menu);







module.exports=route;