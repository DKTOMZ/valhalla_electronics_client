import { BackendServices } from "@/app/api/inversify.config";
import { UtilService } from "@/services/utilService";
import mongoose from "mongoose";

const utilService = BackendServices.get<UtilService>('UtilService');

/**
 * CurrencyRates schema for mongodb. Used to create a currency rate before db operations.
 */
const CurrencyRatesSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    rate: {
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
 * Currency rate model for mongodb. Used to perform db CRUD operations.
 */
const CurrencyRates = mongoose.models.currencyRates || mongoose.model('currencyRates', CurrencyRatesSchema);

export default CurrencyRates;