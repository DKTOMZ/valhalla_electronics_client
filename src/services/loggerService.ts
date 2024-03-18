import { injectable } from "inversify";

/**
 * Service to handle console logging for dev environment
 */
@injectable()
export class LoggerService {
    log(output: any) {
        console.log(output);
    }
}