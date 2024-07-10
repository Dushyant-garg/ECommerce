const express = require('express')
const mongoose = require('mongoose')
var session = require('express-session')
const verifyUser = require('./utils/verifyUser.js')
const userRoute = require('./routes/userRoute.js')
const productRoute = require('./routes/productRoute.js')
const orderRoute = require('./routes/orderRoute.js')
const Product = require('./models/Product.js')
const User = require('./models/User.js')

const app = express()

app.use(session({
    secret: 'nlsdaC4654SC',
    resave: false,
    saveUninitialized: true
}))

const connect = async () => {
    try {
        await mongoose.connect("mongodb+srv://dushyantgarg37:sAvVSRJITNy2nR7f@cluster0.bva2i6g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        console.log("connected to mongodb")
    } catch (err) {
        throw err
    }
}

mongoose.connection.on("disconnected", () => {
    console.log("mongodb disconnected")
})

app.set('view engine', 'ejs')
app.set("views", "public")
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/uploads'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", verifyUser, async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = 3
    try {
        const products = await Product.find()
        .sort({createdAt:-1})
        .skip((page - 1) * limit)
        .limit(limit)


        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        res.render(__dirname + "/public/index.ejs", {
            products: products,
            currentPage: page,
            totalPages: totalPages,
        })
        // res.status(200).send(products)
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

app.get("/products", verifyUser, async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = 3
    try {
        const products = await Product.find()
            .skip((page - 1) * limit)
            .limit(limit)

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            products,
            currentPage: page,
            totalPages
        });
        // res.status(200).send(products)
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})


app.get("/get-cart", verifyUser, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate("cart.productId")
        res.render(__dirname + "/public/cart.ejs", {
            products: user.cart,
        })
        // res.status(200).send(user.cart)
    }
    catch (error) {
        res.status(500).json(error.message)
    }
})

app.use("/auth", userRoute)
app.use("/product", productRoute)
app.use("/order", orderRoute)

app.get("/product/script.js", (req, res) => {
    res.sendFile(__dirname + '/public/script.js')
})

app.listen(3000, () => {
    connect()
    console.log('server started')
})