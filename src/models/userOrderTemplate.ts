import { OrderProduct } from "./order";

export interface userOrderTemplate {
    customerName?: string;
    siteEmail: string;
    orderId: string;
    customerAddress?: string;
    customerCity?: string;
    customerPostalCode?: string;
    customerCountry?: string;
    customerPhone?: string;
    cartItems: OrderProduct[];
    currency: string;
    subTotal: number;
    shipping: string;
    promocode?: string,
    discount?: number,
    total: number;
}