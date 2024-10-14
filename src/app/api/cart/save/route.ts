import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Product } from "@/models/products";
import { Cart as CartType} from "@/models/cart";
import Cart from "@/lib/cartSchema";
import { UtilService } from "@/services/utilService";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const utilService = BackendServices.get<UtilService>('UtilService');

export async function GET(req: NextRequest) {
    if(!process.env.NEXT_PUBLIC_COOKIE_NAME){
        throw new Error('Missing NEXT_PUBLIC_COOKIE_NAME property in env file');
    }

    const token = await getToken({ req, cookieName: process.env.NEXT_PUBLIC_COOKIE_NAME });

    if(!token) {
        return new Response(JSON.stringify({error:'Please login to access this service'}),{status:401,headers:{
            'Content-Type':'application/json'
        }})
    }

    return new Response(JSON.stringify({error:'GET Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

/**
* POST Request handler for /api/products/save route.
*/
export async function POST(req: NextRequest) {

    if(!process.env.NEXT_PUBLIC_COOKIE_NAME){
        throw new Error('Missing NEXT_PUBLIC_COOKIE_NAME property in env file');
    }

    const token = await getToken({ req, cookieName: process.env.NEXT_PUBLIC_COOKIE_NAME });

    if(!token) {
        return new Response(JSON.stringify({error:'Please login to access this service'}),{status:401,headers:{
            'Content-Type':'application/json'
        }})
    }

    const { email, cartItem }:{email: string, cartItem: Product} = await req.json();

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

    if (!email) {
        return new Response(JSON.stringify({error:'email is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!cartItem) {
        return new Response(JSON.stringify({error:'cartItem is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    try { 

        const existingCart = await Cart.findOne<CartType>({email: email});

        if (!existingCart) {
            await Cart.create({
                email: email,
                cartItems: [cartItem]
            });

            return new Response(JSON.stringify({size:1}),{status:201,headers:{
                'Content-Type':'application/json'
            }});
        }

        const existingCartItem = existingCart.cartItems.filter((item)=>item._id==cartItem._id);

        if(existingCartItem.length > 0) {
            return new Response(JSON.stringify({error:'Product already in cart'}),{status:409,headers:{
                'Content-Type':'application/json'
            }});
        }

        await Cart.updateOne({email:email,cartItems:[...existingCart.cartItems, cartItem], updated: utilService.getCurrentDateTime()});

        const cartAfterUpdate = await Cart.findOne<CartType>({email: email});

        return new Response(JSON.stringify({size:cartAfterUpdate?.cartItems.length,cart: cartAfterUpdate}),{status:201,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}