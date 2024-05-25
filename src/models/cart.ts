import { Product } from "./products";

export interface Cart {
    _id: string,
    email: string,
    cartItems: Product[],
    created: Date,
    updated: Date
}