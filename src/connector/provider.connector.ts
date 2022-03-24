
import { SymbolDecimal } from "../knownAddresses";
import { CallObject, Receipt } from "../model";

export interface ProviderConnector{
    traceTransaction(txHash:string, customTracer: string):Promise<CallObject>;
    getTransactionReceipt(txHash:string):Promise<Receipt>;
    resolveContractNamesAndTokenSymbolDecimals() : boolean;
    resolveContractNamesSymbolsAndDecimals?(
        contractAddresses:string[], tokenAddresses:string[]) 
    : Promise<{
        contractNames: {address:string, name:string }[],
        tokenSymbolsAndDecimals:{address: string, symbolDecimal: SymbolDecimal}[]}>;
}