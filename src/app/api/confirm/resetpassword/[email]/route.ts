import { DbConnService } from "@/services/dbConnService";
import { JWTService } from "@/services/jwtService";
import appUser from "@/lib/userSchema";
import {BackendServices} from "@/app/api/inversify.config";
import { UserServer } from "@/models/User";
import { JWTPurpose } from "@/models/JWTPurpose";
import { MailService } from "@/services/mailService";
import { GenericUserTemplate } from "@/models/genericUserTemplate";
import { MailTemplates } from "@/models/mailTemplates";
import { NextRequest } from "next/server";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const jwtService = BackendServices.get<JWTService>('JWTService');
const mailService = BackendServices.get<MailService>('MailService');

export async function POST() {
    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function GET(req: NextRequest) {

    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
        return new Response(JSON.stringify({error:'Email is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }});
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    const user = await appUser.findOne<UserServer>({email: email});
    if (!user) { 
        return new Response(JSON.stringify({error:'That email does not seem to exist'}),{status:409,headers:{
            'Content-Type':'application/json'
        }})
    }
    if (!user.password) { 
        return new Response(JSON.stringify({error:'Reset with the auth provider linked to this email'}),{status:409,headers:{
            'Content-Type':'application/json'
        }})
     }


    try {
        const response = jwtService.generateJWT(user._id.toString(),JWTPurpose.RESET_PASSWORD);
        if (response.error) { throw new Error(response.error); }
        await mailService.sendMail<GenericUserTemplate>({
            to: user.email, 
            subject: 'Valhalla Gadgets - Password Reset for your account',
            template: MailTemplates.PASSWORD_RESET,
            context: {
                userName: user.name,
                verifyLink: response.success
            }
        });

        return new Response(JSON.stringify({success:true}),{status:200,headers:{
                'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message? error.message : error}),{
            status:503,
            headers: {'Content-Type':'application/json'}
        });
    }
 }