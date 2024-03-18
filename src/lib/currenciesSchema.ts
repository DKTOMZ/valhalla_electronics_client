import mongoose from "mongoose";

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
},{ versionKey: false });

/**
 * Currencies model for mongodb. Used to perform db CRUD operations.
 */
const Currency = mongoose.models.currencies || mongoose.model('currencies', currencySchema);

export default Currency;