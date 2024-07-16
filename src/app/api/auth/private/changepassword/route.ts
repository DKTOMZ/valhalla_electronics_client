import {BackendServices} from "@/app/api/inversify.config";
import appUser from "@/lib/userSchema";
import { UserServer } from "@/models/User";
import { DbConnService } from "@/services/dbConnService";
import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";
import { compare, hash } from "bcryptjs";
import { getToken } from "next-auth/jwt";


//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

export async function GET(req: any) {
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

export async function POST(req: any) {
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
    }}))

    const body = await req.json();

    if (!body) { return new Response(JSON.stringify({error:'Request data/body is missing'}),{status:400,headers:{
        'Content-Type':'application/json'
    }}) }

    const { newPassword, currentPassword }: {newPassword:string, currentPassword:string} = body;

    if (!newPassword) { return new Response(JSON.stringify({error:'New Password is missing'}),{status:400,headers:{
        'Content-Type':'application/json'
    }}) }

    if (!currentPassword) { return new Response(JSON.stringify({error:'Current Password is missing'}),{status:400,headers:{
        'Content-Type':'application/json'
    }}) }

    const user = await appUser.findOne<UserServer>({email:token.email})

    if (!user) { return new Response(JSON.stringify({error:'User does not exist anymore'}),{status:409,headers:{
        'Content-Type':'application/json'
    }}) }

    else {
        if (currentPassword.length < 6) { return new Response(JSON.stringify({error:'Current Password should be at least 6 characters long'}),{status:409,headers:{
            'Content-Type':'application/json'
        }}) }
        
        if (currentPassword.length > 20) { return new Response(JSON.stringify({error:'Current Password should be not be more than 20 characters long'}),{status:409,headers:{
            'Content-Type':'application/json'
        }})}

        if (newPassword.length < 6) { return new Response(JSON.stringify({error:'New Password should be at least 6 characters long'}),{status:409,headers:{
            'Content-Type':'application/json'
        }}) }
        
        if (newPassword.length > 20) { return new Response(JSON.stringify({error:'New Password should be not be more than 20 characters long'}),{status:409,headers:{
            'Content-Type':'application/json'
        }})}

        if(!user.password) {
            return new Response(JSON.stringify({error:'Password change unauthorized due to third party account'}),{status:403,headers:{
                'Content-Type':'application/json'
            }})
        }

        const isPasswordSameAsExisting = await compare(newPassword, user.password);

        if(isPasswordSameAsExisting) {
            return new Response(JSON.stringify({error:'New password should not be the same as current password'}),{status:409,headers:{
                'Content-Type':'application/json'
            }})
        }

        const isCurrentPasswordSameAsExisting = await compare(currentPassword, user.password);

        if(!isCurrentPasswordSameAsExisting) {
            return new Response(JSON.stringify({error:'Current Password is incorrect'}),{status:409,headers:{
                'Content-Type':'application/json'
            }})
        }

        const hashedPasword = await hash(newPassword,12);

        try {

            await appUser.updateOne({ email:user.email},{ password: hashedPasword, updated: CURRENT_DATE_TIME()});

            return new Response(JSON.stringify({success:true}),{status:201,headers:{
                'Content-Type':'application/json'
            }});

        } catch (error:any) {

            return new Response(JSON.stringify({error:error.message}),{status:503,headers:{
                'Content-Type':'application/json'
            }});

        }
    }
}
