import { BackendServices } from "@/app/api/inversify.config";
import { UtilService } from "@/services/utilService";
import mongoose from "mongoose";

const utilService = BackendServices.get<UtilService>('UtilService');

/**
 * Currencies schema for mongodb. Used to create a currency before db operations.
 */
const currencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true,
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
 * Currencies model for mongodb. Used to perform db CRUD operations.
 */
const Currency = mongoose.models.currencies || mongoose.model('currencies', currencySchema);

export default Currency;