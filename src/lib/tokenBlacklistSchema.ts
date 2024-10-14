import { BackendServices } from "@/app/api/inversify.config";
import { UtilService } from "@/services/utilService";
import mongoose from "mongoose";

const utilService = BackendServices.get<UtilService>('UtilService');

/**
 * Token Blacklist schema for mongodb. Used to store used tokens that have not yet expired as revoked/blacklisted.
 */
const tokenBlacklistSchema = new mongoose.Schema({
    tokenJti: {
        type: String,
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
 * TokenBlacklist model for mongodb. Used to perform db CRUD operations.
 */
const TokenBlacklist = mongoose.models.tokenBlacklist || mongoose.model('tokenBlacklist', tokenBlacklistSchema);

export default TokenBlacklist;