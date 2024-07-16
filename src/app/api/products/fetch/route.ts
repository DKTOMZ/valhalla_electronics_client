import Product from "@/lib/productSchema";
import { Product as productType } from "@/models/products";
import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

export async function POST() {

    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function GET(req: NextRequest) {

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    let objectId: mongoose.Types.ObjectId ;

    const id = req.nextUrl.searchParams.get('id');

    if(id){
        try {
            objectId = new mongoose.Types.ObjectId(id);
        } catch (error:any) {
            return new Response(JSON.stringify({'error':'Invalid product id. Product does not exist'}),{status:404,headers:{
                'Content-Type':'application/json'
            }});
        }
    
    
        try {
            const product = await Product.find({_id:objectId});
    
            if(!product || product.length === 0){
                return new Response(JSON.stringify({'error':'Product not found'}),{status:404,headers:{
                    'Content-Type':'application/json'
                }});
            }
    
            return new Response(JSON.stringify(product[0]),{status:200,headers:{
                'Content-Type':'application/json'
            }});
        } catch (error:any) {
            return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
                'Content-Type':'application/json'
            }})
        }
    }

    try {
        const products = await Product.find<productType>();

        return new Response(JSON.stringify(products),{status:200,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}