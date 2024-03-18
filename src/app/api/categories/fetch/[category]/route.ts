import Category from "@/lib/categorySchema";
import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { Category as categoryType } from "@/models/categories";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import mongoose from "mongoose";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

export async function POST(req: NextRequest) {

    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function GET(req: NextRequest,{params}:{params:{category:string}}) {

    const name = params['category'].replace('category=','');

    if (!name) {
        return new Response(JSON.stringify({error:'Id is not provided'}),{ status: 409, headers: {
            'Content-Type':'application/json'
        }})
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    try {
        const category = await Category.find<categoryType>({name:name});

        if(category.length === 0) {
            return new Response(JSON.stringify({'error':'Category does not exist'}),{status:200,headers:{
                'Content-Type':'application/json'
            }});
        }

        return new Response(JSON.stringify(category[0]),{status:200,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}