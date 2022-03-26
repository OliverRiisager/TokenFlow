import {getTrace} from './traceGetter';
import {processCalls} from './callProcessor';
import {processLogs} from './logProcessor';
import {insertLogs} from './callLogCombiner';
import {translateCallsAndLogs} from './callLogTranslator';
/* eslint-disable @typescript-eslint/ban-ts-comment*/
// @ts-ignore
import abiDecoder from 'abi-decoder';
/* eslint-enable @typescript-eslint/ban-ts-comment*/
import {
    CallObject,
    DecodedLog,
    Receipt,
    ProcessedCall,
    TransfersNodes,
    GethTrace,
} from './model';
import {DecodedLogConvert} from './jsonConverters';
import {ProviderConnector} from './connector/provider.connector';
import erc20Abi from '../public/abis/erc20.json';
import wethAbi from '../public/abis/wrappedEther.json';

export class TraceProcessor {
    private providerConnector: ProviderConnector;

    constructor(providerConnector: ProviderConnector) {
        abiDecoder.addABI(erc20Abi);
        abiDecoder.addABI(wethAbi);
        this.providerConnector = providerConnector;
    }

    getTransfers(txHash: string) {
        return this.doGetTransfers(txHash);
    }

    getDecodeLogs(receipt: Receipt) {
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

    async getDecodedTrace(rawTransferData: GethTrace): Promise<TransfersNodes> {
        if (rawTransferData.error !== undefined) {
            console.log('hehehe');
            throw new Error(rawTransferData.error);
        }
        const processedCalls = this.getProcessedCalls(rawTransferData);
        const receipt = this.getReceipt(rawTransferData);
        const decodedLogs = this.getDecodeLogs(receipt);
        const processedLogs = processLogs(decodedLogs);
        const combinedTxsAndLogs = insertLogs(processedLogs, processedCalls);

        const nodesAndTxs = await translateCallsAndLogs(
            combinedTxsAndLogs,
            this.providerConnector,
            receipt.from
        );
        return nodesAndTxs;
    }

    private async doGetTransfers(txHash: string): Promise<TransfersNodes> {
        const rawTransferData = await this.getRawTransferData(txHash);
        return await this.getDecodedTrace(rawTransferData);
    }

    private async getRawTransferData(txHash: string): Promise<GethTrace> {
        const rawTransferData: GethTrace = await getTrace(
            txHash,
            this.providerConnector
        );
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
