import { injectable } from "inversify";

/**
 * Service to handle browser local and session storage
 */
@injectable()
export class StorageService {

    private localStorage: Storage | undefined;

    private sessionStorage: Storage | undefined;

    constructor() {
        if(typeof window !== 'undefined'){
            this.localStorage = localStorage;
            this.sessionStorage = sessionStorage;
        }
    }


    addLocalObject = (key: string, value: any) => this.localStorage?.setItem(key, value);

    addSessionObject = (key: string, value: any) => this.sessionStorage?.setItem(key,value);

    getLocalObject = (key: string) => this.localStorage?.getItem(key);

    getSessionObject = (key: string) => this.sessionStorage?.getItem(key);

    removeLocalObject = (key: string) => this.localStorage?.removeItem(key);

    removeSessionObject = (key: string) => this.sessionStorage?.removeItem(key);

}