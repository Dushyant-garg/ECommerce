const User = require("../models/User.js")

module.exports = verifySeller = async (req,res,next)=>{
    try {
        const existUser = await User.findById(req.session.userId)
        console.log(existUser)
        if(existUser.role === "seller"){
            next()
        }
        else{
            console.log("else")
            res.status(500).json({message:"You are not authorized to access this page"})
        }
    } catch (error) {
        res.status(500).json({message:"error.message"})
    }
}