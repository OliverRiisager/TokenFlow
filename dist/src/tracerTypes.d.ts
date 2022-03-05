export interface LogIndex {
    logIndex: number;
}
export interface Call {
    type: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasUsed: string;
    input: string;
    output: string;
    logs: LogIndex[];
}
export interface CallObject {
    type: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasUsed: string;
    input: string;
    output: string;
    calls: Call[];
}
export interface Log {
    address: string;
    topics: string[];
    data: string;
    status: boolean;
    to: string;
    transactionHash: string;
    transactionIndex: number;
    type: string;
}
export interface Receipt {
    blockHash: string;
    blockNumber: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    effectiveGasPrice: string;
    from: string;
    gasUsed: string;
    logs: Log[];
}
//# sourceMappingURL=tracerTypes.d.ts.map