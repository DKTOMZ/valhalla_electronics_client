import {BackendServices} from "@/app/api/inversify.config";
import appUser from "@/lib/userSchema";
import { UserServer } from "@/models/User";
import { JWTPurpose } from "@/models/JWTPurpose";
import { DbConnService } from "@/services/dbConnService";
import { JWTService } from "@/services/jwtService";
import { MailService } from "@/services/mailService";
import { hash } from "bcryptjs";
import { GenericUserTemplate } from "@/models/genericUserTemplate";
import { MailTemplates } from "@/models/mailTemplates";
import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";


//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const mailService = BackendServices.get<MailService>('MailService');
const jwtService = BackendServices.get<JWTService>('JWTService');

export async function GET() {
    return new Response(JSON.stringify({error:'GET Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

/**
* POST Request handler for /api/auth/signup route.
*/
export async function POST(request: Request) {
    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

    const body = await request.json();

    if (!body) { return new Response(JSON.stringify({error:'Request data/body is missing'}),{status:400,headers:{
        'Content-Type':'application/json'
    }}) }

    const { email, password }: {email:string, password:string} = body;

    const userExists = await appUser.findOne<UserServer>({email})

    if (userExists) { return new Response(JSON.stringify({error:'User already exists'}),{status:409,headers:{
        'Content-Type':'application/json'
    }}) }

    else {
        if (password.length < 6) { return new Response(JSON.stringify({error:'Password should be at least 6 characters long'}),{status:409,headers:{
            'Content-Type':'application/json'
        }}) }
        
        if (password.length > 20) { return new Response(JSON.stringify({error:'Password should be not be more than 20 characters long'}),{status:409,headers:{
            'Content-Type':'application/json'
        }})}

        const hashedPasword = await hash(password,12);

        try {
    
            const data = await appUser.create({
                name: email.slice(0,email.indexOf('@')).replace('.',' '),
                email: email,
                password: hashedPasword
            });

            const user = {
                name: data.name,
                email: data.email,
                _id: data._id
            }

              const response = jwtService.generateJWT(user._id.toString(),JWTPurpose.EMAIL);
              if (response.error) { throw new Error(response.error); }
              await mailService.sendMail<GenericUserTemplate>({
                  to: user.email, 
                  subject: 'Valhalla Gadgets - Welcome!',
                  template: MailTemplates.NEW_USER,
                  context: {
                    userName: user.name,
                    verifyLink: response.success
                  }
              });

            return new Response(JSON.stringify({success:true}),{status:201,headers:{
                'Content-Type':'application/json'
            }});

        } catch (error: any) {

            return new Response(JSON.stringify({error:error.message}),{status:503,headers:{
                'Content-Type':'application/json'
            }});

        }
    }
}