import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import Currency from "@/lib/currenciesSchema";
import { CurrenciesType } from "@/models/currencies";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

export async function POST() {

    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function GET() {

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    try {
        const currencies = await Currency.find<CurrenciesType>();

        return new Response(JSON.stringify(currencies),{status:200,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}