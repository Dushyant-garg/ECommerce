const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,path.join(__dirname, "..", "uploads"))
    },
    filename: function (req,file,cb){
        cb(null,+Date.now()+"-"+file.originalname)
    }
})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg"){
        cb(null,true)
    }
    else{
        cb("Add only .jpeg or .png files",false)
    }
}

module.exports = upload = multer({
    storage: storage,
    fileFilter: fileFilter,
})
