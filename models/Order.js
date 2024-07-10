const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types
const orderSchema = new mongoose.Schema({
    product: {
        type: ObjectId,
        ref: 'Product'
    },
    buyer: {
        type: ObjectId,
        ref: 'User'
    },
    seller: {
        type: ObjectId,
        ref: 'User'
    }
}, { timestamps: true }
)

module.exports = mongoose.model("Order", orderSchema)