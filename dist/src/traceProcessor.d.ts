import { GethTrace } from './traceGetter';
import Web3 from 'web3';
import { AbiDecoderService, AbiService } from './services';
import { DecodedLog, Receipt, ProcessedCall, TransfersNodes } from './model';
export declare class TraceProcessor {
    web3: Web3;
    abiDecoderWrapper: AbiDecoderService;
    abiService: AbiService;
    constructor();
    extendWeb3(_web3Instance: Web3): Web3;
    getTransfers(txHash: string): Promise<TransfersNodes>;
    doGetTransfers(txHash: string): Promise<TransfersNodes>;
    getRawTransferData(txHash: string): Promise<GethTrace>;
    getProcessedCalls(rawTransferData: GethTrace): ProcessedCall[];
    getReceipt(rawTransferData: GethTrace): Receipt;
    getCombinedTxsAndLogs(receipt: Receipt, processedCalls: ProcessedCall[]): import("./model").Transfer[];
    getDecodeLogs(receipt: Receipt): (DecodedLog | null)[];
}
