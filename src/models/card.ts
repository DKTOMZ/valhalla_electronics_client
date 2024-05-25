import { Product } from "./products";

export interface Card {
    image: string, title: string, price?: number, oldPrice?: number, description?: string, id:string,
    product?: Product
}