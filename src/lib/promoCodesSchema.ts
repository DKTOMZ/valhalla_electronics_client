import { BackendServices } from "@/app/api/inversify.config";
import { UtilService } from "@/services/utilService";
import mongoose from "mongoose";

const utilService = BackendServices.get<UtilService>('UtilService');

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
        default: utilService.getCurrentDateTime()
    },
    updated: {
        type: Date,
        required: false,
        default: utilService.getCurrentDateTime()
    }
},{ versionKey: false });

/**
 * Promocode model for mongodb. Used to perform db CRUD operations.
 */
const PromoCode = mongoose.models.promocode || mongoose.model('promocode', PromoCodeSchema);

export default PromoCode;