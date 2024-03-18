import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Product } from "@/models/products";
import Currency from "@/lib/currenciesSchema";
import { CurrenciesType } from "@/models/currencies";
import { Cart as CartType} from "@/models/cart";
import Cart from "@/lib/cartSchema";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

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

            return new Response(JSON.stringify({success:true}),{status:201,headers:{
                'Content-Type':'application/json'
            }});
        }

        const existingCartItem = existingCart.cartItems.filter((item)=>item._id==cartItem._id);

        if(existingCartItem) {
            return new Response(JSON.stringify({error:'Product already in cart'}),{status:409,headers:{
                'Content-Type':'application/json'
            }});
        }

        await Cart.updateOne({email:email,cartItems:[...existingCart.cartItems, cartItem]});

        return new Response(JSON.stringify({success:true}),{status:201,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}