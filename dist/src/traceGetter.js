"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrace = void 0;
const tslib_1 = require("tslib");
const gethCustomTracer_1 = require("./gethCustomTracer");
const jsonConverters_1 = require("./jsonConverters");
function getTrace(txhash, web3) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const gethTrace = yield getGethTrace(web3, txhash);
        return gethTrace;
    });
}
exports.getTrace = getTrace;
function getGethTrace(web3, txhash) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            /* eslint-disable */
            // @ts-ignore
            const callObjectData = yield web3.debug.traceTransaction(txhash, { reexec: 5000, tracer: gethCustomTracer_1.tracer });
            /* eslint-enable */
            const callObject = jsonConverters_1.ConvertCallObject.toCallObject(JSON.stringify(callObjectData));
            const receiptData = yield web3.eth.getTransactionReceipt(txhash);
            const receipt = jsonConverters_1.ConvertReceipt.toReceipt(JSON.stringify(receiptData));
            return { callObject: callObject, receipt: receipt };
        }
        catch (e) {
            const error = 'An error occured when getting Geth Trace ' + e;
            console.log(error);
            return { callObject: null, receipt: null, error: error };
        }
    });
}
//# sourceMappingURL=traceGetter.js.map