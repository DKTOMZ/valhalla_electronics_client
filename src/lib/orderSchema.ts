import { BackendServices } from "@/app/api/inversify.config";
import { UtilService } from "@/services/utilService";
import mongoose from "mongoose";

const utilService = BackendServices.get<UtilService>('UtilService');

/**
 * order schema for mongodb. Used to create a order before db operations.
 */
const orderSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    products: {
        type: [{}],
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    shippingRate: {
        type: String,
        required: true
    },
    shippingFee: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    deliveryStatus: {
        type: String,
        required: false,
        default: 'PENDING'
    },
    paymentStatus: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: false,
        default: 0
    },
    promocode: {
        type: String,
        required: false,
        default: null
    },
    created: {
        type: Date,
        required: false,
        default: utilService.getCurrentDateTime()
    },
    updated: {
        type: Date,
        required: false,
        default: utilService.getCurrentDateTime()
    },
    currency: {
        type: String,
        required: true
    }
},{ versionKey: false });

/**
 * Order model for mongodb. Used to perform db CRUD operations.
 */
const Order = mongoose.models.orders || mongoose.model('orders', orderSchema);

export default Order;