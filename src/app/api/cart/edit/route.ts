import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import Cart from "@/lib/cartSchema";
import { Cart as CartType } from "@/models/cart";
import { Product } from "@/models/products";
import { UtilService } from "@/services/utilService";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const utilService = BackendServices.get<UtilService>('UtilService');

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

    const { userEmail, cartItems }:{userEmail: string, cartItems: Product[]} = await req.json();

    if (!userEmail) {
        return new Response(JSON.stringify({error:'userEmail parameter is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!cartItems) {
        return new Response(JSON.stringify({error:'cartItems parameter is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    try {            

        await Cart.updateOne({email: userEmail}, {cartItems : cartItems, updated: utilService.getCurrentDateTime()});

        const updatedCart = await Cart.findOne<CartType>({email:userEmail});

        return new Response(JSON.stringify(updatedCart),{status:200,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}

export async function GET(req:NextRequest) {

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