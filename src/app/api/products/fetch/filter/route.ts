import Product from "@/lib/productSchema";
import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

export async function POST() {
    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function GET(req: NextRequest) {

    const category = req.nextUrl.searchParams.get('category');

    if (!category) {
        return new Response(JSON.stringify({error:'category is not provided'}),{ status: 409, headers: {
            'Content-Type':'application/json'
        }})
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));


    try {
        const product = await Product.find({category:category});

        if(!product || product.length === 0){
            return new Response(JSON.stringify({'error':'Products not found'}),{status:404,headers:{
                'Content-Type':'application/json'
            }});
        }

        return new Response(JSON.stringify(product),{status:200,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}