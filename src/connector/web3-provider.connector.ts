import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { BatchRequest } from "web3-core";
import { ProviderConnector } from "./provider.connector";

export class Web3Provider implements ProviderConnector{

    protected readonly web3: Web3;

    protected batch: BatchRequest;

    constructor(web3: Web3){
        this.web3 = this.extendWeb3(web3);
        this.batch = new web3.BatchRequest();
    }

    /* eslint-disable */
    addRequestToBatch(req: any): void {
        if(this.batch === undefined || this.batch === null){
            this.batch = new this.web3.BatchRequest();
        }
        this.batch.add(req);
    }

    executeBatch(): void {
        if(this.batch === undefined || this.batch === null){
            throw new Error("Batch null or undefined.");
        }
        this.batch.execute();
    }

    async traceTransaction(txHash: string, customTracer: string): Promise<any> {
        try{
            return await (this.web3 as any).debug.traceTransaction(
                txHash,
                {reexec: 5000, tracer: customTracer}
            );
        }catch(e){
            console.log("ERR: " + e);
            throw e;
        }
    }

    async getTransactionReceipt(txHash: string): Promise<any> {        
        try{
            return await this.web3.eth.getTransactionReceipt(txHash) as any;
        }catch(e){
            console.log("ERR: " + e);
            throw e;
        }
    }
    /* eslint-enable */

    getContract(abiItem: AbiItem, address: string): Contract {
        return new this.web3.eth.Contract(abiItem, address);
    }

    private extendWeb3(_web3Instance: Web3): Web3 {
        _web3Instance.extend({
            property: 'debug',
            methods: [
                {
                    name: 'traceTransaction',
                    call: 'debug_traceTransaction',
                    params: 2,
                },
            ],
        });
        return _web3Instance;
    }
}