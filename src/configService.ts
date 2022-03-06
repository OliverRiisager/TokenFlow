
import {Config} from './model';

export class ConfigService {

    config: Config;
    static instance : ConfigService;

    constructor() { }

    static getInstance()  : ConfigService{
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }

        return ConfigService.instance;
    }

    setConfig(configObj: Config) : void{
        if(configObj.httpGethProvider === undefined){
            throw new Error("config obj doesnt contain httpGethProvider value");
        }
        
        this.config = configObj;
    }

    setConfigFromUrl(providerAddress : string) : void{

        if(typeof(providerAddress) !== typeof("")){
            throw new Error("providerAddress is not of correct type");
        }
        if(providerAddress){
            if(this.config === undefined){
                this.config = new Config();
            }
            this.config.httpGethProvider = providerAddress;
        }else{
            throw new Error("providerAddress doest not contain a proper string");
        }
    }
}