import { DbConnService } from "@/services/dbConnService";
import appUser from "@/lib/userSchema";
import {BackendServices} from "@/app/api/inversify.config";
import { JWTService } from "@/services/jwtService";
import { UserServer } from "@/models/User";
import { NextRequest } from "next/server";


//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const jwtService = BackendServices.get<JWTService>('JWTService');

export async function POST() {
    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function GET(req: NextRequest ) {

    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
        return new Response(JSON.stringify({error:'Invalid Link'}),{status:404,headers:{
            'Content-Type':'application/json'
        }});
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    let userId;

    try {
        userId = jwtService.verify(token);
    } catch (error) {
        return new Response(JSON.stringify({error:'Sorry. This link seems incorrect or has already expired'}),{
            status:200, 
            headers: {'Content-Type':'application/json'}
        });
    }

    try {
        const user = await appUser.findOne<UserServer>({_id:userId});
        if ( user && user.emailVerified) { 
            return new Response(JSON.stringify({error:"Sorry. Email is already verified or link has been used."}),{
                status:200,
                headers: {'Content-Type':'application/json'}
            });
        }
        await appUser.updateOne({ _id: userId },{ emailVerified: true, updated: new Date()});
        return new Response(JSON.stringify({success:true}),{
            status:200,
            headers: {'Content-Type':'application/json'}
        });
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message? error.message : error}),{
            status:503,
            headers: {'Content-Type':'application/json'}
        });
    }
 }