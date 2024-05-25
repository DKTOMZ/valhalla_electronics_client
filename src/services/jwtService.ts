import {FrontendServices} from "@/lib/inversify.config";
import { injectable } from "inversify";
import { LoggerService } from "./loggerService";
import { JWTPurpose } from "@/models/JWTPurpose";
import { nanoid } from "nanoid";

import jwt, {Secret} from 'jsonwebtoken';

/**
 * Service to handle generation and verification of jwt's
 */
@injectable()
export class JWTService {
    private devLogger: LoggerService;
    private readonly appSecret: Secret
    constructor() {
        this.devLogger = FrontendServices.get<LoggerService>('DevLoggerService');
        if(!process.env.NEXTAUTH_SECRET){
            throw new Error("Missing environment variable 'NEXTAUTH_SECRET'");
        }
        this.appSecret = process.env.NEXTAUTH_SECRET;
    }
    generateJWT = (userId: string, purpose: JWTPurpose) => {
        try {
            const token = jwt.sign({
                userId: userId,
                jti: nanoid()
            },
            this.appSecret,
            {
                expiresIn: '12h'
            },
            );
            const url = `${process.env.NEXT_PUBLIC_VALHALLA_URL}/${purpose===JWTPurpose.EMAIL ? 'pages/confirm' : 'pages/auth'}/${purpose===JWTPurpose.EMAIL ? 'email' : 'changepassword'}/?token=${token}`;
            return {success:url};
        } catch (error: any) {
            this.devLogger.log(error.message??error);
            return error.message ?? error;
        }
    };

    verify = (token: string) => {

        return new Promise<string>((resolve)=> {
            jwt.verify(token, this.appSecret, (error, decoded) => {
                if (error) {
                    throw new Error(JSON.stringify(error));
                }
                const decodedToken = decoded as { userId: string, jti: string };
                resolve(decodedToken.userId);
            });
        })
    }

    decode = (token: string) => {
        try {
            return jwt.decode(token) as { userId: string, jti: string };
        } catch (error:any) {
            this.devLogger.log(error.message??error);
            throw new Error(error);
        }
    }
}