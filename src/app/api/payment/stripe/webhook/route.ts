import { BackendServices } from "@/app/api/inversify.config";
import Cart from "@/lib/cartSchema";
import Order from "@/lib/orderSchema";
import Product from "@/lib/productSchema";
import ShippingRates from "@/lib/shippingRatesSchema";
import { MailTemplates } from "@/models/mailTemplates";
import { OrderProduct, OrderType } from "@/models/order";
import { Product as ProductType } from "@/models/products";
import { ShippingRate } from "@/models/shippingRate";
import { userOrderTemplate } from "@/models/userOrderTemplate";
import { DbConnService } from "@/services/dbConnService";
import { MailService } from "@/services/mailService";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import Stripe from "stripe";

if(!process.env.STRIPE_SECRET_KEY){
    throw new Error('STRIPE_SECRET_KEY is missing')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const mailService = BackendServices.get<MailService>('MailService');
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') ?? '';
    let event: Stripe.Event;

    if(!process.env.STRIPE_WEBHOOK_SECRET){
        throw new Error('STRIPE_WEBHOOK_SECRET is missing')
    }    

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        return new Response(JSON.stringify({error:err.message}),{status:400,headers:{
            'Content-Type':'application/json'
        }});
    }

    let mongooseInstance: mongoose.Connection;

    try {
        mongooseInstance = await dbConnService.mongooseConnect();
    }
    catch(error:any) {
        return    new Response(JSON.stringify({error:error}),{status:503,headers:{
            'Content-Type':'application/json'
        }})
    }

    if(event.type == 'checkout.session.completed') {
        //Retrieve stripe session information
        const session = event.data.object;
        let cartItemsFinal: OrderProduct[] = [];

        if(!session.customer_email){
            console.log('customer_email not provided during checkout');
            return new Response(JSON.stringify({error:'customer_email not provided during checkout'}),{status:500,headers:{
                'Content-Type':'application/json'
            }});   
        }

        if(!session.metadata?.orderId){
            console.log('missing orderId in session metadata');
            return new Response(JSON.stringify({error:'missing orderId in session metadata'}),{status:500,headers:{
                'Content-Type':'application/json'
            }});   
        }

        const line_items = await stripe.checkout.sessions.listLineItems(session.id, {
            expand: ['data.price.product']
        });
        line_items.data.map((item)=>{
            if(item.price && item.price.product && item.price.product){
                const stripeProduct= item.price.product as Stripe.Product;
                const orderProduct: OrderProduct = {
                    _id: stripeProduct.metadata['id'],
                    brand: stripeProduct.metadata['brand'],
                    category: stripeProduct.metadata['category'],
                    contents: stripeProduct.metadata['contents'],
                    description: stripeProduct.name??'',
                    image: stripeProduct.images[0],
                    name: stripeProduct.name,
                    properties: JSON.parse(stripeProduct.metadata['properties']),
                    quantity: item.quantity??0,
                    totalPrice: (item.price.unit_amount??0)/100,
                    unitPrice: (item.price.unit_amount??0)/100,
                    productUrl: process.env.NEXT_PUBLIC_VALHALLA_URL+'/pages/product?id='+stripeProduct.metadata['id']
                };
                cartItemsFinal.push(orderProduct);
            }
        });

        //Fetch available shipping details
        const shippingDetails =  await ShippingRates.find<ShippingRate>();

        const shipping = shippingDetails.find((s)=>s._id==session.metadata?.shippingId);

        const dbSession = await mongooseInstance.startSession();

        dbSession.startTransaction();

        //Create Order, Update Stock, Send order mail and clear customer cart
        try {
            let order: OrderType = {
                userEmail: session.customer_email,
                products: cartItemsFinal,
                orderId: session.metadata.orderId,
                paymentId: session.payment_intent?.toString()??'',
                subTotal: (session.amount_subtotal??0)/100,
                total: (session.amount_total??0)/100,
                shippingRate: shipping?.name??'',
                shippingFee: session.shipping_cost?.amount_total??0,
                paymentMethod: session.payment_method_types[0],
                paymentStatus: session.payment_status,
                currency:  session.currency?.toUpperCase()??''
            };
            if(session.metadata.promocode){
                order.promocode = session.metadata.promocode;
            }
            if(session.metadata.discount){
                order.discount = ((session.amount_total??0)/100)-((session.amount_subtotal??0)/100);
            }

            await Order.create<OrderType>(order);

            cartItemsFinal.map(async(item)=>{
                const product = await Product.findById<ProductType>(item._id);
                if(product && item.quantity){
                    const newStock = product?.stock-item.quantity;
                    await Product.updateOne({_id:item._id},{stock: newStock >= 0 ? newStock : 0});
                }
            });

            const customerDetails = session.customer_details;
            const mailData: userOrderTemplate = {
                cartItems: cartItemsFinal,
                currency: session.currency?.toUpperCase()??'',
                orderId: session.metadata.orderId??'',
                shipping: session.shipping_cost && session.shipping_cost.amount_total > 0 ? (shipping?.name??'') + ' worth ' + (session.currency?.toUpperCase()??'') + ' ' + (session.shipping_cost?.amount_total??0)/100 : (shipping?.name??''),
                siteEmail: process.env.NEXT_PUBLIC_VALHALLA_EMAIL??'',
                subTotal: (session.amount_subtotal??0)/100,
                total: (session.amount_total??0)/100
            }

            if(customerDetails){
                mailData.customerName = customerDetails.name??''
                mailData.customerPhone = customerDetails.phone??'';
            }

            if(customerDetails?.address){
                mailData.customerAddress = customerDetails.address.line1??customerDetails.address.line2??'';
                mailData.customerCity = customerDetails.address.city??'';
                mailData.customerCountry = customerDetails.address.country??'';
                mailData.customerPostalCode = customerDetails.address.postal_code??'';
            }

            if(session.metadata.promocode && session.metadata.discount){
                mailData.discount = parseFloat(((parseInt(session.metadata.discount)*((session.amount_subtotal??0)/100))/100).toFixed(2));
                //mailData.promocode = session.metadata.promocode;
            }

            session.customer_details && session.customer_details.address && await mailService.sendMail<userOrderTemplate>({
                to: session.customer_email??'',
                subject: `Valhalla Electronics - Order confirmed! - ${session.metadata.orderId}`,
                template: MailTemplates.USER_ORDER,
                context: mailData
            });

            await Cart.updateOne({email: session.customer_email}, {
                cartItems: []
            });

            await dbSession.commitTransaction();

            console.log("Commit: Stripe payment Transaction");

            return new Response(JSON.stringify({success:true}),{status:200,headers:{
                'Content-Type':'application/json'
            }});
        } catch (error: any) {
            await dbSession.abortTransaction();

            console.log("Rollback: Stripe payment Transaction");

            console.log(error);
            
            return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
                'Content-Type':'application/json'
            }})
        } finally {
            dbSession.endSession();
        }

    } else {
        return new Response(JSON.stringify({success:true}),{status:200,headers:{
            'Content-Type':'application/json'
        }});
    }
}

export async function GET() {
    return new Response(JSON.stringify({error:'GET Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}