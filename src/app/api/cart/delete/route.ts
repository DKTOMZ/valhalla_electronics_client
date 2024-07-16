import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import Cart from "@/lib/cartSchema";
import { Cart as CartType } from "@/models/cart";
import mongoose from "mongoose";
import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

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

    let objectId: mongoose.Types.ObjectId ;
    const { userEmail, itemId }:{userEmail: string, itemId: string} = await req.json();

    if (!userEmail) {
        return new Response(JSON.stringify({error:'userEmail parameter is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!itemId) {
        return new Response(JSON.stringify({error:'itemId parameter is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    try {
        objectId = new mongoose.Types.ObjectId(itemId);
    } catch (error:any) {
        return new Response(JSON.stringify({'error':'Invalid cart item id. Cart item does not exist anymore'}),{status:404,headers:{
            'Content-Type':'application/json'
        }});
    }

    try {

        await Cart.updateOne({email: userEmail}, {$pull : {cartItems : {_id:objectId.toString()}}, updated: CURRENT_DATE_TIME()});

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