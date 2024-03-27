import { Product } from "./products";

export interface Cart {
    _id: string,
    userEmail: string,
    cartItems: Product[],
    created: Date,
    updated: Date
}