// noinspection JSUnusedGlobalSymbols

import { Product } from "./products";

export interface ShippingInfo {
    country: string,
    address: string,
    city: string,
    postalCode: string,
    phoneNumber: string,
    firstName: string,
    lastName: string,
    products: Product[]
}