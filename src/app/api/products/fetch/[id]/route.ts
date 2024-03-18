import Product from "@/lib/productSchema";
import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";
import mongoose from "mongoose";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

export async function POST(req: NextRequest) {
    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function GET(req: NextRequest,{params}:{params:{id:string}}) {

    let objectId: mongoose.Types.ObjectId ;
    const id = params['id'].replace('id=','');

    if (!id) {
        return new Response(JSON.stringify({error:'Id is not provided'}),{ status: 409, headers: {
            'Content-Type':'application/json'
        }})
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

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