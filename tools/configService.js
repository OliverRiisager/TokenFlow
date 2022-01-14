

const config = {};

function setConfig(configObj){
    if(configObj.hasOwnProperty(httpGethProvider)){
        config = configObj;
    }
    
    throw new Error("config obj doesnt contain httpGethProvider value");
}

function setConfigFromAddress(providerAddress){

    if(typeof(providerAddress) !== typeof("")){
        throw new Error("providerAddress is not of correct type");
    }
    if(providerAddress){
        config.httpGethProvider = providerAddress;
    }else{
        throw new Error("providerAddress doest not contain a proper string");
    }
}

module.exports = {
    setConfig,
    setConfigFromAddress,
    config
}