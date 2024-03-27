import mongoose from "mongoose";

/**
 * cart schema for mongodb. Used to create a user cart before db operations.
 */
const cartSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    cartItems: {
        type: [{}],
        required: true
    },
    created: {
        type: Date,
        required: false,
        default: new Date()
    },
    updated: {
        type: Date,
        required: false,
        default: new Date()
    }
},{ versionKey: false });

/**
 * Cart model for mongodb. Used to perform db CRUD operations.
 */
const Cart = mongoose.models.cart || mongoose.model('cart', cartSchema);

export default Cart;