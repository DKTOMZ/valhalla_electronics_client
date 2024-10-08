import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";
import mongoose from "mongoose";

/**
 * promoCode schema for mongodb. Used to create a promo code before db operations.
 */
const PromoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    validUntil: {
        type: String,
        required: true,
    },    
    discountPercent: {
        type: Number,
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
 * Promocode model for mongodb. Used to perform db CRUD operations.
 */
const PromoCode = mongoose.models.promocode || mongoose.model('promocode', PromoCodeSchema);

export default PromoCode;