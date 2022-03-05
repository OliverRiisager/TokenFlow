export = translateCallsAndLogs;
declare function translateCallsAndLogs(combinedLogsAndTxs: any, web3: any, senderAddress: any, erc20abi: any): Promise<{
    transfers: any;
    nodes: {
        address: any;
        name: any;
    }[];
}>;
//# sourceMappingURL=callLogTranslator.d.ts.map