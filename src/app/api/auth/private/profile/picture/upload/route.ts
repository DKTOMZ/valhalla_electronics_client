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

    const formData = await req.formData();

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

    if (!formData.has('email')) {
        return new Response(JSON.stringify({error:'email key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    } 

    const email = formData.get('email')?.toString();

    const profilePicture = formData.get('profile_pic') as File;

    if(!profilePicture) {
        return new Response(JSON.stringify({error:'Please upload one image'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if(!profilePicture.type.includes('image')) {
        return new Response(JSON.stringify({error:'Please upload an image document'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    const bucketName = process.env.S3_BUCKETNAME;
    const region = process.env.S3_REGION;

    if(!region || !bucketName || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_ACCESS_KEY) { 
        return new Response(JSON.stringify({error:'A credential/property is missing'}),{status:500, headers:{
            'Content-Type':'application/json'
        }})
    }

    const client = new S3({
        region: region,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
        }
    });

    var imageLink: {Key: string, link: string} = {
        Key: '', link: ''
    };

    const saveFileToS3 = async (user: UserServer) => {

          const extension = profilePicture.name.split('.').pop();
          const newFileName = `${user._id.toString()}_${Date.now()}.${extension}`;
          const body = Buffer.from(await profilePicture.arrayBuffer());

            await client.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: newFileName,
                ACL: 'public-read',
                Body: body,
                ContentType: `image/${extension}`
              })
            );
            imageLink.Key = newFileName;
            imageLink.link =`https://${bucketName}.s3.${region}.amazonaws.com/${newFileName}`
    }

    const deleteExistingProfilePicture = async() => {
        const params = {
            Bucket: bucketName,
            Prefix: userExists?._id.toString(), // Use the common prefix
          };
        

            const data = await client.listObjectsV2(params);
            const objectsToDelete = data.Contents?.filter(obj => obj.Key?.startsWith(userExists?._id.toString()||''));
        
            if (objectsToDelete && objectsToDelete.length > 0) {
              const deleteParams = {
                Bucket: bucketName,
                Delete: {
                  Objects: objectsToDelete.map(obj => ({ Key: obj.Key })),
                  Quiet: false,
                },
              };
        
              await client.deleteObjects(deleteParams);
              //console.log('Objects deleted:', deleteData.Deleted);
            } else {
              //console.log('No objects found matching the prefix.');
            }
    }
        

    const userExists = await appUser.findOne<UserServer>({email:email});

    if (!userExists) { return new Response(JSON.stringify({error:'User does not exist anymore'}),{status:409,headers:{
        'Content-Type':'application/json'
    }}) }

    else {
        try {
            await deleteExistingProfilePicture();

            //await client.deleteObject({Bucket:bucketName,Key:userExists._id.toString()})
            
            await saveFileToS3(userExists);

            await appUser.updateOne({email:email},{image:imageLink.link, updated: new Date()});

            return new Response(JSON.stringify({
                image: imageLink.link,
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
