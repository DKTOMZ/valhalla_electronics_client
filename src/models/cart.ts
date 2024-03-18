import { Product } from "./products";

export interface Cart {
    userEmail: string,
    cartItems: Product[]
}