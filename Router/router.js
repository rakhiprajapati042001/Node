
//create a router with the help of Router class inside express framework
const route=require("express").Router();
const loginController=require("../Controller/signUp");
const authMiddleware=require('../configuration/middleware/authMiddleware')
const authSessionMiddleware=require('../configuration/middleware/sessionMiddleware')

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
const upload = multer({ dest: 'uploads/' });


/**
 * @swagger
 * components:
 *   schemas:
 *     ExampleResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Message indicating the success of the request.
 *       example:
 *         message: Send Successfully
 */

/**
 * @swagger
 * /example:
 *   get:
 *     summary: Retrieve example data
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExampleResponse'
 */

route.get("/example", loginController.example);




/**
 * components:
 *   schema:
 *     signUPResponse:
 *         type: object
 *          properties:
 *                 userName:
 *                      type:string
 *                  userEmail:
 *                        type:string
 *                  password:
 *                        type:string
 *                  confirmPassword:
 *                        type:string
 *                   
 *
 * 
 * 
 * */



/**
 * @swagger
 * /signUP:
 *   post:
 *     summary: this api for signup user
 *     responses:
 *       '200':
 *         description: Successful signUp
 *         content:
 *           application/json:
 *             schema:
 *                  items.$ref: '#/components/schema/signUPResponse'
 */




route.post("/signUP", loginController.signUP);
route.post("/login", loginController.login);

//ques-(why we use thi route method)
//ans-apply route middleware for specific route 
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
route.post("/import_Excel_Sheet", upload.single('excel'),loginController.importExcelSheet);

route.post("/vendors", loginController.vendors);
route.post("/vendorConnection", loginController.vendorConnection);
route.post("/csv",upload.single('excel'),loginController.csv);

route.post("/csvs",upload.single('excel'),loginController.csvs);
route.post("/cards",loginController.card);



// route.post("/csvExcelImport",upload.single('excel'),loginController.csvExcelImport);

route.post("/getTableColumns", loginController.getTableColumns);
route.post("/csvExcelImport",loginController.csvExcelImport);


route.post("/updateProfile",upload.single("image"),loginController.updateProfile);




//ROUTING CHANING EXAMPLE
//route.post("/login",authMiddleware1,authMiddleware2, loginController.createUserProfile);

route.post("/generateSignature",loginController.generateSignature);

route.post("/decodeToken",loginController.decodeToken);

route.get("/streamAPI",loginController.streamApi);
route.get("/zipFileThrowStreaming",loginController.zipFileThrowStreaming);

route.post("/loginSession",loginController.loginSession);

route.post("/registerUser",loginController.registerUser);
route.post("/customerDetails",loginController.customerDetails);
route.post("/creditNumbermasked",loginController.creditNumbermasked);

route.post("/customerDecriptDetails",loginController.customerDecriptDetails);





module.exports=route;