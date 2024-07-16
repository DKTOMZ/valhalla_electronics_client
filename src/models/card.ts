import { Product } from "./products";

export interface Card {
    image: string, 
    title: string,
    description?: string,
    id:string,
    product?: Product
}