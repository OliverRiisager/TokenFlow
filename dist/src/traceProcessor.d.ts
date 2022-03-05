export = traceProcessor;
declare class traceProcessor {
    web3: any;
    txs: any[];
    extendWeb3(_web3Instance: any): any;
    getTransfers(txHash: any): Promise<{
        transfers: any;
        nodes: {
            address: any;
            name: any;
        }[];
    }>;
    doGetTransfers(txHash: any): Promise<{
        transfers: any;
        nodes: {
            address: any;
            name: any;
        }[];
    }>;
}
//# sourceMappingURL=traceProcessor.d.ts.map