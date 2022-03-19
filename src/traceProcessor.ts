import {getTrace} from './traceGetter';
import {processCalls} from './callProcessor';
import {processLogs} from './logProcessor';
import {insertLogs} from './callLogCombiner';
import {translateCallsAndLogs} from './callLogTranslator';
import {AbiDecoderService, AbiService} from './services';
import {
    CallObject,
    DecodedLog,
    Receipt,
    ProcessedCall,
    TransfersNodes,
    GethTrace
} from './model';
import {DecodedLogConvert} from './jsonConverters';
import { ProviderConnector } from './connector/provider.connector';

export class TraceProcessor {
    private providerConnector: ProviderConnector;

    private  abiDecoderService: AbiDecoderService = AbiDecoderService.getInstance();

    private abiService: AbiService = AbiService.getInstance();

    constructor(providerConnector: ProviderConnector) {
        const abiDecoder = this.abiDecoderService.abiDecoder;
        abiDecoder.addABI(this.abiService.getErc20Abi());
        abiDecoder.addABI(this.abiService.getWeth20abiAbi());
        this.providerConnector = providerConnector;
    }

    getTransfers(txHash: string) {
        return this.doGetTransfers(txHash);
    }

    getDecodeLogs(receipt: Receipt) {
        const abiDecoder = this.abiDecoderService.abiDecoder;
        abiDecoder.keepNonDecodedLogs();
        const decodedLogJsonString = JSON.stringify(
            abiDecoder.decodeLogs(receipt.logs)
        );
        const decodedLogs: (DecodedLog | null)[] =
            DecodedLogConvert.toDecodedLog(decodedLogJsonString);
        if (decodedLogs === null) {
            throw 'JSON converting logs failed';
        }
        return decodedLogs;
    }

    private async doGetTransfers(txHash: string): Promise<TransfersNodes> {
        const rawTransferData = await this.getRawTransferData(txHash);
        const processedCalls = this.getProcessedCalls(rawTransferData);
        const receipt = this.getReceipt(rawTransferData);
        const decodedLogs = this.getDecodeLogs(receipt);
        const processedLogs = processLogs(decodedLogs);
        const combinedTxsAndLogs = insertLogs(
            processedLogs,
            processedCalls
        );

        const nodesAndTxs = await translateCallsAndLogs(
            combinedTxsAndLogs,
            this.providerConnector,
            receipt.from
        );
        return nodesAndTxs;
    }

    private async getRawTransferData(txHash: string): Promise<GethTrace> {
        const rawTransferData: GethTrace = await getTrace(txHash, this.providerConnector);
        if (rawTransferData.error !== undefined) {
            throw rawTransferData.error;
        }
        return rawTransferData;
    }

    private getProcessedCalls(rawTransferData: GethTrace): ProcessedCall[] {
        const callObject: CallObject | null = rawTransferData.callObject;
        if (callObject === null) {
            throw 'Callobject is null - please double check your providerconnector';
        }
        return processCalls(callObject);
    }

    private getReceipt(rawTransferData: GethTrace) {
        const receipt = rawTransferData.receipt;
        if (receipt === null) {
            throw 'Receipt is null - please double check your providerconnector';
        }
        return receipt;
    }
}
