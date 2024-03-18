import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import Favorites from "@/lib/favoritesSchema";
import { FavoritesType } from "@/models/favorites";
import { Product } from "@/models/products";
import appUser from '@/lib/userSchema';
import { UserServer } from "@/models/User";

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

    const { email, product }:{email: string, product: Product} = await req.json();

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

    if (!email) {
        return new Response(JSON.stringify({error:'email key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!product) {
        return new Response(JSON.stringify({error:'product key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    try { 

        const existingFavorite = await Favorites.findOne<FavoritesType>({product:{_id:product._id}});

        if (existingFavorite) {
            throw new Error('Product already in favorites');
        }

        const user = await appUser.findOne<UserServer>({email:email});

        if(!user) {
            return new Response(JSON.stringify({error:'User does not exist'}), { status: 409, headers: {
                'Content-Type':'application/json'
            }});
        }

        await Favorites.create({ userId: user?.email, product: product});

        return new Response(JSON.stringify({success:true}),{status:201,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        if (error.message === 'Product already in favorites') {
            return new Response(JSON.stringify({error:error.message}), { status: 409, headers: {
                'Content-Type':'application/json'
            }});
        }
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}