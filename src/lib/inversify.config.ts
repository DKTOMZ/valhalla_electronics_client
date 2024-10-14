import "reflect-metadata";
import { Container } from "inversify";
import { HttpService } from "@/services/httpService";
import { StorageService } from "@/services/storageService";
import { ValidationService } from "@/services/validationService";
import { LoggerService } from "@/services/loggerService";
import { UtilService } from "@/services/utilService";

const FrontendServices = new Container();
FrontendServices.bind<HttpService>('HttpService').to(HttpService).inSingletonScope();
FrontendServices.bind<StorageService>('StorageService').to(StorageService).inSingletonScope();
FrontendServices.bind<ValidationService>('ValidationService').to(ValidationService).inSingletonScope();
FrontendServices.bind<LoggerService>('DevLoggerService').to(LoggerService).inSingletonScope();
FrontendServices.bind<UtilService>('UtilService').to(UtilService).inSingletonScope();



export {FrontendServices};
