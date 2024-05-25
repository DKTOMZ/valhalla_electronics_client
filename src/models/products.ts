export interface Product {
    _id: string,
    name: string,
    brand: string,
    description: string,
    contents: string,
    price: number,
    images: {Key: string, link: string}[],
    category: string,
    properties: any,
    discount: number,
    stock: number,
    created: Date,
    updated: Date,
    quantityInCart?: number
} 