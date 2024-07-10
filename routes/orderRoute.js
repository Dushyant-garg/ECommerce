const express = require('express')
const path = require('path')
const Product = require('../models/Product.js')
const verifyUser = require('../utils/verifyUser.js')
const Order = require('../models/Order.js')
const User = require('../models/User.js')
const router = express.Router()

router.post("/create-order", verifyUser, async(req,res)=>{
    const {id} = req.body
    const product = await Product.findById(id)
    const newOrder = new Order({
        product:id,
        buyer:req.session.userId,
        seller:product.seller
    })
    await newOrder.save()
    res.status(200).send(newOrder)
})

router.get('/orders', verifyUser, async(req,res)=>{
    try {
        const user = await User.findById(req.session.userId)
        let orders;
        if(user.role === "seller"){
            orders = await Order.find({seller:req.session.userId})
            .populate("product")
            .populate("buyer","username")
            .populate("seller")
        }
        else{
            orders = await Order.find({buyer:req.session.userId})
            .populate("product")
            .populate("buyer","username")
            .populate("seller")
        }
        res.render(path.join(__dirname, "..", "public", "order.ejs"), {
            orders: orders,
        })
        // res.status(200).send(orders)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router