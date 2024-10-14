import { BackendServices } from "@/app/api/inversify.config";
import { UtilService } from "@/services/utilService";
import mongoose from "mongoose";

const utilService = BackendServices.get<UtilService>('UtilService');

/**
 * Category schema for mongodb. Used to create a category before db operations.
 */
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    parentCategory: {
        type: Object,
        required: false,
        default: {name:''}
    },
    properties: {
        type: Array,
        required: false,
        default:[]
    },
    childCategories: { 
        type: Array,
        required: false,
        default: []
    },
    images: {
        type: Array,
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
 * Category model for mongodb. Used to perform db CRUD operations.
 */
const Category = mongoose.models.categories || mongoose.model('categories', categorySchema);

export default Category;