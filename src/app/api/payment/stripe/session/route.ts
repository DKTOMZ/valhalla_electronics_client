import Product from "@/lib/productSchema";
import { Cart } from "@/models/cart";
import { CurrenciesType } from "@/models/currencies";
import { NextRequest } from "next/server";
import Stripe from 'stripe';
import { Product as ProductType } from "@/models/products";
import ShippingRates from "@/lib/shippingRatesSchema";
import { ShippingRate } from "@/models/shippingRate";
import { PromocodeType } from "@/models/promocode";

if(!process.env.STRIPE_SECRET_KEY){
    throw new Error('STRIPE_SECRET_KEY is missing')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {

    const {cart, shippingId, shippingFee, currency, cartTotal, promocode}: {cart: Cart, shippingId: string, shippingFee: number, currency: CurrenciesType, cartTotal: number, promocode?: PromocodeType} = await req.json();

    // console.log(cart);
    // console.log(shippingId);
    // console.log(shippingFee);
    // console.log(currency);
    // console.log(cartTotal);
    // console.log(promocode);

    if (!cart) {
        return new Response(JSON.stringify({error:'cart is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    if (!cart.email) {
        return new Response(JSON.stringify({error:'email is missing from cart'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (shippingId == null) {
        return new Response(JSON.stringify({error:'shippingId is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    if (shippingFee == null) {
        return new Response(JSON.stringify({error:'shippingFee is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!currency) {
        return new Response(JSON.stringify({error:'currency is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (cartTotal == null) {
        return new Response(JSON.stringify({error:'cartTotal is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    //Check if stock of all cart products is still available before initiating checkout process
    const unavailableProducts: string[] = [];
    cart.cartItems.map(async(item)=>{
        const product = await Product.findById<ProductType>(item._id);
        if(product && product.stock == 0) {
            unavailableProducts.push(product.name);
        }
    })
    if(unavailableProducts.length > 0){
        return new Response(JSON.stringify({error:`${unavailableProducts.length} products in your cart are currently out of stock. Please remove them or try again later.`}),{status:500,headers:{
            'Content-Type':'application/json'
        }});
    }

    //Fetch chosen shipping details
    const shippingDetails =  await ShippingRates.find<ShippingRate>({_id:shippingId});

    let shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [];

    shippingDetails.map((i)=>{
        const deliveryEstimate: Stripe.Checkout.SessionCreateParams.ShippingOption.ShippingRateData.DeliveryEstimate = {};
        deliveryEstimate.minimum = {
            unit: 'business_day',
            value: i.minimumDeliveryDays
        };
        if(i.maximumDeliveryDays){
            deliveryEstimate.maximum = {
                unit: 'business_day',
                value: i.maximumDeliveryDays
            };
        }
        return shippingOptions.push(
            {
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                      amount: Math.round(i.rate*cartTotal),
                      currency: currency.shortName
                    },
                    display_name: i.name,
                    delivery_estimate: deliveryEstimate
                  },
            },
        );
    });

    //Create stripe checkout session
    try {

        const orderId = 'VO' + Date.now();

        const checkoutParams: Stripe.Checkout.SessionCreateParams = {
            metadata: {
                orderId: orderId,
                shippingId: shippingId
            },
            customer_email: cart.email,
            line_items: cart.cartItems.map((item)=>{
                const adjustable: any = {
                    enabled: true,
                };
                if(item.stock > 1){
                    adjustable.minimum = 1;
                    adjustable.maximum = item.stock;
                } else {
                    adjustable.enabled = false;
                }
                return {
                    price_data: {
                        currency: currency.shortName,
                        product_data: {
                            name: item.name,
                            images: item.images.map((i)=>i.link),
                            metadata: {
                                id: item._id,
                                brand: item.brand,
                                category: item.category,
                                contents: item.contents,
                                properties: JSON.stringify(item.properties),
                            }
                        },
                        unit_amount: Math.round(((item.price-((item.discount*item.price)/100))/(item.quantityInCart||0))*100),
                    },
                    adjustable_quantity: adjustable,
                    quantity: item.quantityInCart
                }
            }),
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ["card"],
            phone_number_collection: {enabled: true},
            shipping_address_collection: {
                allowed_countries: ['US', 'KE', 'GB']
            },
            billing_address_collection: 'auto',
            success_url: `${process.env.NEXT_PUBLIC_VALHALLA_URL}/pages/orderComplete/?id=${orderId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_VALHALLA_URL}/pages/checkout`,
            shipping_options: shippingOptions,
            currency: currency.shortName.toLowerCase(),
        }

        if(promocode){
            if(checkoutParams.metadata){
                let couponId: string;
                try {
                    const existingCoupon = await stripe.coupons.retrieve(promocode.code);
                    couponId =  existingCoupon.id
                } catch (error) {
                    const coupon = await stripe.coupons.create({
                        percent_off: promocode.discountPercent,
                        name: promocode.code,
                        id: promocode.code,
                        redeem_by: Math.floor(new Date(promocode.validUntil).getTime()/1000)
                    })
                    couponId = coupon.id;
                }

                checkoutParams.discounts = [{
                    coupon: couponId
                }]
                checkoutParams.metadata.promocode = promocode.code
                checkoutParams.metadata.discount = promocode.discountPercent;
            }
        }
        
        const session = await stripe.checkout.sessions.create(checkoutParams);

        return new Response(JSON.stringify({stripeSession: session}),{status:200,headers:{
            'Content-Type':'application/json'
        }});
        
    } catch (error: any) {
        return new Response(JSON.stringify({error:error.message}),{status:503,headers:{
            'Content-Type':'application/json'
        }}); 
    }
}

export async function GET() {
    return new Response(JSON.stringify({error:'GET Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}