import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { PromocodeType } from "@/models/promocode";
import Promocode from "@/lib/promoCodesSchema";

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

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    const code = req.nextUrl.searchParams.get('code');

    if (!code) {
        return new Response(JSON.stringify({error:'code is not provided'}),{ status: 409, headers: {
            'Content-Type':'application/json'
        }})
    }

    try {
        const promocode = await Promocode.find<PromocodeType>({code:code});

        if(promocode.length === 0) {
            return new Response(JSON.stringify({'error':'Promocode does not exist'}),{status:404,headers:{
                'Content-Type':'application/json'
            }});
        }

        if(new Date() >= new Date(promocode[0].validUntil)){
            return new Response(JSON.stringify({'error':'Promocode has expired'}),{status:404,headers:{
                'Content-Type':'application/json'
            }});
        }

        return new Response(JSON.stringify(promocode[0]),{status:200,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}