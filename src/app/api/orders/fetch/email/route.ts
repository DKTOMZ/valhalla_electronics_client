import Order from "@/lib/orderSchema";
import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";
import { OrderType } from "@/models/order";
import { getToken } from "next-auth/jwt";

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

    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

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

    const email = req.nextUrl.searchParams.get('userEmail');

    if (!email) {
        return new Response(JSON.stringify({error:'userEmail is not provided'}),{ status: 409, headers: {
            'Content-Type':'application/json'
        }})
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));


    try {

        const orders = await Order.find<OrderType>({userEmail: email});

        if(!orders || orders.length === 0){
            return new Response(JSON.stringify({error:'No orders found'}),{status:404,headers:{
                'Content-Type':'application/json'
            }});
        }

        return new Response(JSON.stringify(orders),{status:200,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}