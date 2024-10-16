import { BackendServices } from "@/app/api/inversify.config";
import { UtilService } from "@/services/utilService";
import mongoose from "mongoose";

const utilService = BackendServices.get<UtilService>('UtilService');

/**
 * User schema for mongodb. Used to create a user before database operations in auth processes.
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        default: ''
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        match: [utilService.getEmailRegex(), 'Invalid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    image: {
        type: String,
        required: false,
        default: ''
    },
    emailVerified: {
        type: Boolean,
        required: false,
        default: false
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
 * User model for mongodb. Used to perform db CRUD operations.
 */
const appUser = mongoose.models.users || mongoose.model('users', userSchema);

export default appUser;