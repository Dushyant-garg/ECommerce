module.exports = verifyUser = (req,res,next) => {
    if(req.session.isLoggedIn){
        next()
    }
    else if(req.path === "/"){
        res.redirect("/auth/signin")
    }
    else{
        res.redirect("/auth/signin")
        // res.status(500).send({ message: "You are not logged in" })
        // return
    }
}