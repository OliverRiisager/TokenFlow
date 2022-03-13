import {getTrace} from './traceGetter';
import {processCalls} from './callProcessor';
import {processLogs} from './logProcessor';
import {insertLogs} from './callLogCombiner';
import {translateCallsAndLogs} from './callLogTranslator';
import Web3 from 'web3';
import {ConfigService, AbiDecoderService, AbiService} from './services';
import {
    CallObject,
    DecodedLog,
    Receipt,
    ProcessedCall,
    TransfersNodes,
    GethTrace
} from './model';
import {DecodedLogConvert} from './jsonConverters';

export class TraceProcessor {
    web3: Web3;

    abiDecoderWrapper: AbiDecoderService = AbiDecoderService.getInstance();

    abiService: AbiService = AbiService.getInstance();

    constructor() {
        const abiDecoder = this.abiDecoderWrapper.abiDecoder;
        abiDecoder.addABI(this.abiService.getErc20Abi());
        abiDecoder.addABI(this.abiService.getWeth20abiAbi());

        const config = ConfigService.getInstance().getConfig();

        if (config === undefined) {
            throw 'config not defined - please create config through configservice.';
        }

        const web3Instance = new Web3(
            new Web3.providers.HttpProvider(config.httpGethProvider)
        );
        this.web3 = this.extendWeb3(web3Instance);
    }

    getTransfers(txHash: string) {
        return this.doGetTransfers(txHash);
    }

    private async doGetTransfers(txHash: string): Promise<TransfersNodes> {
        const rawTransferData = await this.getRawTransferData(txHash);
        const processedCalls = this.getProcessedCalls(rawTransferData);
        const receipt = this.getReceipt(rawTransferData);
        const combinedTxsAndLogs = this.getCombinedTxsAndLogs(
            receipt,
            processedCalls
        );

        const nodesAndTxs = await translateCallsAndLogs(
            combinedTxsAndLogs,
            this.web3,
            receipt.from
        );
        return nodesAndTxs;
    }

    private async getRawTransferData(txHash: string): Promise<GethTrace> {
        const rawTransferData: GethTrace = await getTrace(txHash, this.web3);
        if (rawTransferData.error !== undefined) {
            throw rawTransferData.error;
        }
        return rawTransferData;
    }

    private getProcessedCalls(rawTransferData: GethTrace): ProcessedCall[] {
        const callObject: CallObject | null = rawTransferData.callObject;
        if (callObject === null) {
            throw 'Callobject is null - please double check your config';
        }
        return processCalls(callObject);
    }

    private getReceipt(rawTransferData: GethTrace) {
        const receipt = rawTransferData.receipt;
        if (receipt === null) {
            throw 'Receipt is null - please double check your config';
        }
        return receipt;
    }

    private getCombinedTxsAndLogs(receipt: Receipt, processedCalls: ProcessedCall[]) {
        const decodedLogs = this.getDecodeLogs(receipt);
        const processedLogs = processLogs(decodedLogs);
        return insertLogs(processedLogs, processedCalls);
    }

    private getDecodeLogs(receipt: Receipt) {
        const abiDecoder = this.abiDecoderWrapper.abiDecoder;
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

    private extendWeb3(_web3Instance: Web3): Web3 {
        _web3Instance.extend({
            property: 'debug',
            methods: [
                {
                    name: 'traceTransaction',
                    call: 'debug_traceTransaction',
                    params: 2,
                },
            ],
        });
        return _web3Instance;
    }
}
