const mail=require('nodemailer')
const transpoter=mail.createTransport({
    service:"gmail",
    port:"587",
    host:"smtp.gmail.com",
    auth:{
        user:"rakhiprajapati042001@gmail.com",
        pass:"qbsl cpcy ppai zdey"
    }
})



module.exports.sendEmail=async function(userMail,otp,res)
{

    const mailOptions= {
        from:"rakhiprajapati042001@gmail.com",
        to:userMail,
        subject:"Profile Created Succesfully!",
        
    }
    if (otp) {
        mailOptions.text = `Your OTP is: ${otp}`;
    } else {
        mailOptions.text = "Login first!";
    }

    transpoter.sendMail(mailOptions,function(err,info){
     if(err){
            console.log(err)
            console.log("err")

        }else{
            console.log(info);
            console.log("info")

        }
    })
}




   
