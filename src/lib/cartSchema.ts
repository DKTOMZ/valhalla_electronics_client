import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";
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
        default: CURRENT_DATE_TIME()
    },
    updated: {
        type: Date,
        required: false,
        default: CURRENT_DATE_TIME()
    }
},{ versionKey: false });

/**
 * Cart model for mongodb. Used to perform db CRUD operations.
 */
const Cart = mongoose.models.cart || mongoose.model('cart', cartSchema);

export default Cart;