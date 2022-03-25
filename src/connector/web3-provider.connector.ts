import Web3 from "web3";
import { BatchRequest } from "web3-core";
import { ProviderConnector } from "./provider.connector";
import { CallObject, Receipt } from "../model";
import { ConvertReceipt, ConvertCallObject } from "../jsonConverters";
import { tokenAddressToSymbolDecimals, contractAddressToNames, SymbolDecimal } from "../knownAddresses";
import { Contract } from "web3-eth-contract";
import erc20Abi from '../../public/abis/erc20.json';
export class Web3Provider implements ProviderConnector{

    protected readonly web3: Web3;

    protected batch: BatchRequest;
    
    protected addressToTokens: Map<string, Contract> = new Map<string, Contract>();
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
            if(!contractAddressToNames.hasContractAddress(element)){
                if(!this.addressToContractMap.has(element)){
                    this.addressToContractMap.set(element, new this.web3.eth.Contract(erc20Abi as any, element));
                }
            }
        });
        tokenAddresses.forEach(element => {
            if(!tokenAddressToSymbolDecimals.hasTokenAddress(element)){
                if(!this.addressToContractMap.has(element)){
                    this.addressToContractMap.set(element, new this.web3.eth.Contract(erc20Abi as any, element));
                }
            }
        });
        const promst: Promise<[string, number, string, string]>[] = [];
        // const promises: Promise<{symbol:string, decimals:number, name:string, address:string}>[] = [];
        // const tokenSymbolPromises: Promise<{symbol:string|number, backup:string|number}>[] = [];
        // const tokenDecimalsPromises: Promise<{decimals:string|number, backup:string|number}>[] = [];
        // const contractPromises: Promise<{contractName: string|number, backup:string|number}>[] = [];
        
        this.addressToContractMap.forEach((contract, address) => {
            const proms = Promise.all([
                new Promise<string>((res, rej) => {
                    
                    const req = contract.methods.symbol().call.request({},'latest',
                    (err: any, data: string) => {
                        if (err) {
                            rej({err, address});
                        } else {
                            res(data);
                        }
                    });
                    this.batch.add(req);
                }).catch(() => {
                    console.log("symbol fail " + address);
                    return address;
                }),

                new Promise<number>((res, rej) => {
                    
                    const req = contract.methods.decimals().call.request({},'latest',
                    (err: any, data: number) => {
                        if (err) {
                            rej({err:err, val:18});
                        } else {
                            res(data);
                        }
                    });
                    this.batch.add(req);
                }).catch(() => {
                    console.log("decimals fail " + address);
                    return 18;
                }),
                new Promise<string>((res, rej) => {
                    
                    const req = contract.methods.name().call.request({},'latest',
                    (err: any, data: string) => {
                        if (err) {
                            rej({err, address});
                        } else {
                            res(data);
                        }
                    });
                    this.batch.add(req);
                }).catch(() => {
                    console.log("symbol fail " + address);
                    return address;
                }),
                new Promise<string>(() => {
                    return address;
                })
            ]);
            promst.push(proms);
        });
        try{
            console.log("PRMOSES");
            this.batch.execute();
            const promiseInformation = await Promise.all(promst);
            console.log("PROM END " + promiseInformation);
            // promiseInformation.forEach(result => {
            //     resolvedContractNames.push({address:result.address, name:result.name});
            //     resolvedTokenSymbolsAndDecimals.push({address:result.address, symbolDecimal:new SymbolDecimal(result.symbol, result.decimals)});
            // })
            return {contractNames: resolvedContractNames, tokenSymbolsAndDecimals:resolvedTokenSymbolsAndDecimals}
        }catch(e){
            console.log(e);
            throw e;
        }
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