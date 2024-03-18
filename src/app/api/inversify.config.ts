import "reflect-metadata";
import { Container } from "inversify";
import { MailService } from "@/services/mailService";
import { DbConnService } from "@/services/dbConnService";
import { JWTService } from "@/services/jwtService";
import { FrontendServices } from "@/lib/inversify.config";
import { LoggerService } from "@/services/loggerService";

const BackendServices = new Container();
BackendServices.bind<DbConnService>('DbConnService').to(DbConnService).inSingletonScope();
BackendServices.bind<MailService>('MailService').to(MailService).inSingletonScope();
BackendServices.bind<JWTService>('JWTService').to(JWTService).inSingletonScope();
FrontendServices.bind<LoggerService>('DevLoggerService').to(LoggerService).inSingletonScope();

export {BackendServices};