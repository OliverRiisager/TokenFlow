export interface Receipt {
    blockHash: string;
    blockNumber: number;
    contractAddress: null;
    cumulativeGasUsed: number;
    effectiveGasPrice: number;
    from: string;
    gasUsed: number;
    logs: ReceiptLog[];
    logsBloom: string;
    status: boolean;
    to: string;
    transactionHash: string;
    transactionIndex: number;
    type: string;
}
export interface ReceiptLog {
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    logIndex: number;
    removed: boolean;
    id: string;
}
