import {BackendServices} from "@/app/api/inversify.config";
import appUser from "@/lib/userSchema";
import { UserServer } from "@/models/User";
import { DbConnService } from "@/services/dbConnService";
import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";


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

    const { email, name }: {email: string ,name: string} = await req.json();

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

    if (!email) {
        return new Response(JSON.stringify({error:'email is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    } 

    if (!name) {
        return new Response(JSON.stringify({error:'name is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    const userExists = await appUser.findOne<UserServer>({email:email});

    if (!userExists) { return new Response(JSON.stringify({error:'User does not exist anymore'}),{status:409,headers:{
        'Content-Type':'application/json'
    }}) }

    else {
        try {

            await appUser.updateOne({email:email},{name: name, updated: new Date()});

            return new Response(JSON.stringify({
                success: true
            }),{status:200,headers:{
                'Content-Type':'application/json'
            }});

        } catch (error:any) {
            
            return new Response(JSON.stringify({error:error.message}),{status:503,headers:{
                'Content-Type':'application/json'
            }});

        }
    }

}
