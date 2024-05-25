export async function GET() {
    return new Response(JSON.stringify({error:'GET Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function POST() {
    return new Response(JSON.stringify({error:'MPESA payments coming soon'}),{status:404,headers:{
        'Content-Type':'application/json'
    }});
}