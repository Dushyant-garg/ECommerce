const express = require('express')
const path = require('path')
const Product = require('../models/Product.js')
const verifyUser = require('../utils/verifyUser.js')
const verifyAdmin = require('../utils/verifyAdmin.js')
const upload = require('../utils/multer.js')
const User = require('../models/User.js')
const verifySeller = require('../utils/verifySeller.js')
const router = express.Router()

router.post("/create-product", verifyUser, verifySeller, upload.single("image"), async (req, res) => {
    console.log(req.body)
    try {
        const newProduct = new Product({
            ...req.body,
            pic: req.file.filename,
            seller:req.session.userId
        })
        await newProduct.save()
        res.status(200).send(newProduct)
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})


router.get("/getOne/:id", verifyUser, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        res.status(200).json(product)
    }
    catch (error) {
        res.status(500).json(error.message)
    }
})

router.delete("/delete-product/:id", verifyUser, verifyAdmin, async (req, res) => {
    try {
        const products = await Product.findByIdAndDelete(req.params.id)
        res.status(200).json("Product deleted successfully")
    }
    catch (error) {
        res.status(500).json(error.message)
    }
})

router.put("/update-product/:id", verifyUser, verifyAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id,
            {
                ...req.body,
                pic: req.file.filename
            },
            { new: true }
        )
        res.status(200).send(product)
    }
    catch (error) {
        res.status(500).json(error.message)
    }
})

router.put("/add-to-cart", verifyUser, async (req, res) => {
    try {
        const { productId } = req.body
        const user = await User.findOne({ _id: req.session.userId, 'cart.productId': productId })
        //addToSet is used so that the element can only be inserted in the array once
        if (!user) {
            await User.findByIdAndUpdate(req.session.userId, {
                $addToSet: { cart: { productId: req.body.productId } }
            }, { new: true })
        }
        res.status(200).send(user)
    }
    catch (error) {
        res.status(500).json(error.message)
    }
})

router.put("/remove-from-cart", verifyUser, async (req, res) => {
    const { id } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.session.userId,
            { $pull: { cart: { productId: id } } },
            { new: true }
        )
        res.status(200).send(user)
    }
    catch (error) {
        res.status(500).json(error.message)
    }
})

router.put('/increase-quantity', verifyUser, async (req, res) => {
    const { productId } = req.body;

    try {
        let user = await User.findOneAndUpdate(
            { _id: req.session.userId, 'cart.productId': productId },
            { $inc: { 'cart.$.quantity': 1 } },
            { new: true }
        );

        res.status(200).send(user.cart.find(item => item.productId.toString() === productId));
    }
    catch (error) {
        res.status(500).json(error.message);
    }
});

router.put('/decrease-quantity', verifyUser, async (req, res) => {
    const { productId } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { _id: req.session.userId, 'cart.productId': productId, 'cart.quantity': { $gt: 1 } },
            { $inc: { 'cart.$.quantity': -1 } },
            { new: true }
        );

        if (!user) {
            await User.findByIdAndUpdate(
                req.session.userId,
                { $pull: { cart: { productId } } },
                { new: true }
            );
        }

        res.status(200).send(user ? user.cart.find(item => item.productId.toString() === productId) : null);
    }
    catch (error) {
        res.status(500).json(error.message);
    }
});

router.get("/create-product", verifyUser, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "createProduct.html"))
})

module.exports = router