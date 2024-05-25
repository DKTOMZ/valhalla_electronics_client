import Category from "@/lib/categorySchema";
import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { Category as categoryType } from "@/models/categories";
import { NextRequest } from "next/server";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

export async function POST() {

    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function GET(req: NextRequest) {

    const name = req.nextUrl.searchParams.get('category');

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
            return new Response(JSON.stringify({'error':'Category does not exist'}),{status:404,headers:{
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