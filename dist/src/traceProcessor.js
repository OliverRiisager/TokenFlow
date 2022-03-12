"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceProcessor = void 0;
const tslib_1 = require("tslib");
const traceGetter_1 = require("./traceGetter");
const callProcessor_1 = require("./callProcessor");
const logProcessor_1 = require("./logProcessor");
const callLogCombiner_1 = require("./callLogCombiner");
const callLogTranslator_1 = require("./callLogTranslator");
const web3_1 = tslib_1.__importDefault(require("web3"));
const services_1 = require("./services");
const jsonConverters_1 = require("./jsonConverters");
class TraceProcessor {
    constructor() {
        this.abiDecoderWrapper = services_1.AbiDecoderService.getInstance();
        this.abiService = services_1.AbiService.getInstance();
        const abiDecoder = this.abiDecoderWrapper.abiDecoder;
        abiDecoder.addABI(this.abiService.erc20abi);
        abiDecoder.addABI(this.abiService.weth20abi);
        const config = services_1.ConfigService.getInstance().config;
        if (config === undefined) {
            throw 'config not defined - please create config through configservice.';
        }
        const web3Instance = new web3_1.default(new web3_1.default.providers.HttpProvider(config.httpGethProvider));
        this.web3 = this.extendWeb3(web3Instance);
    }
    extendWeb3(_web3Instance) {
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
    getTransfers(txHash) {
        return this.doGetTransfers(txHash);
    }
    doGetTransfers(txHash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const rawTransferData = yield this.getRawTransferData(txHash);
            const processedCalls = this.getProcessedCalls(rawTransferData);
            const receipt = this.getReceipt(rawTransferData);
            const combinedTxsAndLogs = this.getCombinedTxsAndLogs(receipt, processedCalls);
            const nodesAndTxs = yield (0, callLogTranslator_1.translateCallsAndLogs)(combinedTxsAndLogs, this.web3, receipt.from);
            return nodesAndTxs;
        });
    }
    getRawTransferData(txHash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const rawTransferData = yield (0, traceGetter_1.getTrace)(txHash, this.web3);
            if (rawTransferData.error !== undefined) {
                throw rawTransferData.error;
            }
            return rawTransferData;
        });
    }
    getProcessedCalls(rawTransferData) {
        const callObject = rawTransferData.callObject;
        if (callObject === null) {
            throw 'Callobject is null - please double check your config';
        }
        return (0, callProcessor_1.processCalls)(callObject);
    }
    getReceipt(rawTransferData) {
        const receipt = rawTransferData.receipt;
        if (receipt === null) {
            throw 'Receipt is null - please double check your config';
        }
        return receipt;
    }
    getCombinedTxsAndLogs(receipt, processedCalls) {
        const decodedLogs = this.getDecodeLogs(receipt);
        const processedLogs = (0, logProcessor_1.processLogs)(decodedLogs);
        return (0, callLogCombiner_1.insertLogs)(processedLogs, processedCalls);
    }
    getDecodeLogs(receipt) {
        const abiDecoder = this.abiDecoderWrapper.abiDecoder;
        abiDecoder.keepNonDecodedLogs();
        const decodedLogJsonString = JSON.stringify(abiDecoder.decodeLogs(receipt.logs));
        const decodedLogs = jsonConverters_1.DecodedLogConvert.toDecodedLog(decodedLogJsonString);
        if (decodedLogs === null) {
            throw 'JSON converting logs failed';
        }
        return decodedLogs;
    }
}
exports.TraceProcessor = TraceProcessor;
//# sourceMappingURL=traceProcessor.js.map