const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        min: 8,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    cart: [{
        productId: {
            type: ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        default:"buyer"
    },
    verificationToken: String,
    passwordResetToken: String
})

module.exports = mongoose.model('User', userSchema)