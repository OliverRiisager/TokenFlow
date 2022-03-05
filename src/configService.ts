
import {config} from '../config';

class configService {

    config: config;
    static instance : configService;

    constructor() { }

    static getInstance()  : configService{
        if (!configService.instance) {
            configService.instance = new configService();
        }

        return configService.instance;
    }

    setConfig(configObj: config) : void{
        if(configObj.httpGethProvider === undefined){
            throw new Error("config obj doesnt contain httpGethProvider value");
        }
        
        this.config = configObj;
    }

    setConfigFromAddress(providerAddress) : void{

        if(typeof(providerAddress) !== typeof("")){
            throw new Error("providerAddress is not of correct type");
        }
        if(providerAddress){
            this.config.httpGethProvider = providerAddress;
        }else{
            throw new Error("providerAddress doest not contain a proper string");
        }
    }
}

export {configService};