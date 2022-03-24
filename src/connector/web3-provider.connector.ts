import Web3 from "web3";
import { BatchRequest } from "web3-core";
import { ProviderConnector } from "./provider.connector";
import { CallObject, Receipt } from "../model";
import { ConvertReceipt, ConvertCallObject } from "../jsonConverters";
import { SymbolDecimal } from "../knownAddresses";
import { Contract } from "web3-eth-contract";
import erc20Abi from '../../public/abis/erc20.json';

export class Web3Provider implements ProviderConnector{

    protected readonly web3: Web3;

    protected batch: BatchRequest;
    
    protected addressToContractMap: Map<string, Contract> = new Map<string, Contract>();

    constructor(web3: Web3){
        this.web3 = this.extendWeb3(web3);
        this.batch = new web3.BatchRequest();
    }

    async traceTransaction(txHash: string, customTracer: string): Promise<CallObject> {
        try{
            //@ts-ignore
            var callObjectData = await (this.web3 as any).debug.traceTransaction(
                txHash,
                {reexec: 5000, tracer: customTracer}
            );
            return ConvertCallObject.toCallObject(JSON.stringify(callObjectData));
        }catch(e){
            console.log("ERR: " + e);
            throw e;
        }
    }

    async getTransactionReceipt(txHash: string): Promise<Receipt> {        
        try{
            var receiptData = await this.web3.eth.getTransactionReceipt(txHash);
            return ConvertReceipt.toReceipt(JSON.stringify(receiptData));
        }catch(e){
            console.log("ERR: " + e);
            throw e;
        }
    }

    resolveContractNamesAndTokenSymbolDecimals() : boolean {return true;}

    async resolveContractNamesSymbolsAndDecimals(
        contractAddresses: string[], 
        tokenAddresses: string[])
    : Promise<{
        contractNames: {address:string, name:string}[],
        tokenSymbolsAndDecimals: {
            address: string, symbolDecimal: SymbolDecimal;
        }[]
    }> 
    {
        const resolvedTokenSymbolsAndDecimals: { address: string; symbolDecimal: SymbolDecimal; }[] = [];
        const resolvedContractNames: {address:string, name:string}[] = [];

        contractAddresses.forEach(element => {
            if(!this.addressToContractMap.has(element)){
                this.addressToContractMap.set(element, new this.web3.eth.Contract(erc20Abi as any, element));
            }
        });
        tokenAddresses.forEach(element => {
            if(!this.addressToContractMap.has(element)){
                this.addressToContractMap.set(element, new this.web3.eth.Contract(erc20Abi as any, element));
            }
        });
        const tokenSymbolPromises: Promise<string>[] = [];
        const tokenDecimalsPromises: Promise<number>[] = [];
        const contractPromises: Promise<string>[] = [];
        this.addressToContractMap.forEach((contract, address) => {
            const symbolCall : () => string = contract.methods.symbol().call;
            const decimalsCall: () => number = contract.methods.decimals().call;
            const nameCall: () => string = contract.methods.name().call;
            this.pushPromise(tokenSymbolPromises, symbolCall, address);
            this.pushPromise(tokenDecimalsPromises, decimalsCall, 18);
            this.pushPromise(contractPromises, nameCall, address);
        });
        this.batch.execute();
        
        const tokenSymbolInformation = await this.resolvePromises(tokenSymbolPromises);
        const tokenDecimalsInformation = await this.resolvePromises(tokenDecimalsPromises);
        for (let index = 0; index < tokenSymbolInformation.length; index++) {
            resolvedTokenSymbolsAndDecimals.push({
                address: tokenSymbolInformation[index].address,
                symbolDecimal: new SymbolDecimal(
                    tokenSymbolInformation[index].symbol,
                    tokenDecimalsInformation[index]
                )
            })
        }

        const contractInformation = await this.resolvePromises(contractPromises);
        for (let i = 0; i < contractInformation.length; i++) {
            resolvedContractNames.push({
                address: contractInformation[i].address,
                name:contractInformation[i].name
            }); 
        }
        return {contractNames: resolvedContractNames, tokenSymbolsAndDecimals:resolvedTokenSymbolsAndDecimals}
    }

    private pushPromise<T>(
        promises: Promise<T>[],
        //@ts-ignore
        functionCall: any,
        backup:any
    ): void {
        promises.push(
            new Promise((res, rej) => {
                const req = functionCall.request({},'latest',
                    (err: any, data: T) => {
                        if (err) {
                            rej({err, backup});
                        } else {
                            res(data);
                        }
                    }
                );
                this.batch.add(req);
            })
        );
    }
    
    private async resolvePromises<T>(promises: Promise<T>[]): Promise<T[]> {
        return Promise.all(
            promises.map((p) => {
                return p.catch((e: any) => {
                    return e.backup ? e.backup : 'unknown';
                });
            })
        );
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