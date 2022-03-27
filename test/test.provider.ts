import { CallObject, Receipt, SymbolDecimal } from "../src";
import { ProviderConnector } from "../src/connector/provider.connector";

export class TestProvider implements ProviderConnector {
    traceTransaction(txHash: string, customTracer: string): Promise<CallObject> {
        throw new Error("Method not implemented.");
    }
    getTransactionReceipt(txHash: string): Promise<Receipt> {
        throw new Error("Method not implemented.");
    }
    resolveContractNamesSymbolsAndDecimals?(contractAddresses: string[], tokenAddresses: string[]): Promise<{ contractNames: { address: string; name: string; }[]; tokenSymbolsAndDecimals: { address: string; symbolDecimal: SymbolDecimal; }[]; }> {
        throw new Error("Method not implemented.");
    }

    resolveContractNamesAndTokenSymbolDecimals(): boolean {
        return false;
    }
}
