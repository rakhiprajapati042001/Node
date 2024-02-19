const mysqlcon=require('../databaseConnection');
const jwt=require('jsonwebtoken');
const config=require('../config')



const authMiddleware = async(req,res,next)=>{
    try {
        const {authorization} = req.headers
        if(!authorization)return res.status(404).json({message:"JWT Not Found💀"})
        const Token = authorization.replace('Bearer ','')
        const id= jwt.verify(Token,config.JWT_SECRET_KEY);
        console.log(id)
       let userId=id.user_id[0].id;
        console.log(userId);
        const userData = await mysqlcon('SELECT * FROM tbl_signup WHERE id = ?',[userId])
        console.log(userData)
        req.user = userData[0]
        console.log(req.user+"req.user")
        next()
    } catch (error) {

       res.status(401).json({
        error
       }) 
    }
  
}

module.exports = authMiddleware