

class configService {
    config = {};

    static instance;

    constructor() { }

    static getInstance() {
        if (!configService.instance) {
            configService.instance = new configService();
        }

        return configService.instance;
    }

    setConfig(configObj){
        if(configObj.httpGethProvider === undefined){
            throw new Error("config obj doesnt contain httpGethProvider value");
        }
        
        this.config = configObj;
    }

    setConfigFromAddress(providerAddress){

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

module.exports = configService