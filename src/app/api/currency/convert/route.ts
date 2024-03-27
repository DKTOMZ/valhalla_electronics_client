import { CurrencyConvert } from "@/models/currencyConvert";
import axios from "axios";
import { NextRequest } from "next/server";
import { json } from "stream/consumers";

export async function POST(req: NextRequest) {

    const {fromValue, fromType, toType}: {fromValue: number, fromType: string, toType: string} = await req.json();

    if (!fromValue) {
        return new Response(JSON.stringify({error:'fromValue key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    if (!fromType) {
        return new Response(JSON.stringify({error:'fromType key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!toType) {
        return new Response(JSON.stringify({error:'toType key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    try {

        const response = await axios.post<CurrencyConvert>(`${process.env.NEXT_PUBLIC_CURRENCY_CONVERTER_URL}`,
        new URLSearchParams({
            'from-value': fromValue.toString(),
            'from-type': fromType,
            'to-type': toType
          }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'User-ID': 'apptomno',
                'API-Key': process.env.NEXT_PUBLIC_CURRENCY_CONVERTER_KEY
            }
        }
        );
    
        return new Response(JSON.stringify(response.data),{status:200,headers:{
            'Content-Type':'application/json'
        }});
        
    } catch (error: any) {
        return new Response(JSON.stringify({error:error.response.data['api-error-msg']||error.response.statusText}),{status:503,headers:{
            'Content-Type':'application/json'
        }});
        
    }
}

export async function GET(req: NextRequest) {
    return new Response(JSON.stringify({error:'GET Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}