import { CallObject, Receipt, SymbolDecimal, TransfersNodes, translateCallsAndLogs } from "../src"
import { ProviderConnector } from "../src/connector/provider.connector";
import { combinedLogsAndTxs, senderAddress, transfersNodesNoExternalTranslation } from './testdata';

class TestProvider implements ProviderConnector {
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

describe('callLogTranslater tests', () => {
    let providerConnector: TestProvider;
    beforeEach(() => {
        providerConnector = new TestProvider();
    })
    it('translates known addresses', () => {
        expect(translateCallsAndLogs(combinedLogsAndTxs, new TestProvider(), senderAddress).then((result) => {
            expect(result).toEqual(transfersNodesNoExternalTranslation);
        }));
    })
})