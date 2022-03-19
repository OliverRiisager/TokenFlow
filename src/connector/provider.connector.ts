export interface ProviderConnector{

    /* eslint-disable */
    //@ts-ignore
    traceTransaction(txHash:string, customTracer: string):Promise<any>;
    getTransactionReceipt(txHash:string):Promise<any>;
    getContract(abiItem:any, address:string) : any;
    addRequestToBatch(promise: Promise<any>):void;
    executeBatch():void;
    /* eslint-enable */
}