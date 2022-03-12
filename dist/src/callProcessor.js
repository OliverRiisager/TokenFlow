"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCalls = void 0;
const tslib_1 = require("tslib");
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
const knownAddresses_1 = require("./knownAddresses");
const methods_model_1 = require("./model/methods.model");
const abiDecoderService_1 = require("./services/abiDecoderService");
const transfer = methods_model_1.Methods.Transfer;
const transferFrom = methods_model_1.Methods.TransferFrom;
const deposit = methods_model_1.Methods.Deposit;
const withdraw = methods_model_1.Methods.Withdraw;
const ethTransfer = methods_model_1.Methods.EthTransfer;
const unknownTransfer = methods_model_1.Methods.Unknown;
const validFunctionNames = [transfer, transferFrom, deposit, withdraw];
const processedCallsArray = [];
let lastCallObjectWithLogs;
let consumableLogs = [];
let consumableErrorMsg = undefined;
let logCompareType;
let hasValue = false;
let interestingInput = false;
let hasLogs = false;
/* eslint-disable @typescript-eslint/no-explicit-any*/
let decodedInput = undefined;
/* eslint-enable @typescript-eslint/no-explicit-any*/
function processCalls(callObject) {
    doProcessCall(callObject, true);
    if (lastCallObjectWithLogs.logs === undefined) {
        lastCallObjectWithLogs.logs = [];
    }
    if (consumableLogs.length > 0) {
        for (let i = 0; i < consumableLogs.length; i++) {
            const notAddedLog = consumableLogs[i];
            lastCallObjectWithLogs.logs.push(notAddedLog);
        }
        lastCallObjectWithLogs.logs.sort(sortLogs);
    }
    return processedCallsArray;
}
exports.processCalls = processCalls;
function doProcessCall(callObject, firstCall = false) {
    const transactionValue = new bignumber_js_1.default(callObject.value);
    hasValue = !transactionValue.isNaN() && !transactionValue.isZero();
    decodedInput = callObject.input
        ? abiDecoderService_1.AbiDecoderService.getInstance().abiDecoder.decodeMethod(callObject.input)
        : undefined;
    validateCall(callObject);
    if (callObject.error !== undefined) {
        addError(callObject, firstCall);
    }
    if (interestingInput) {
        addTransfer(decodedInput['name'], callObject);
    }
    if (hasValue && !interestingInput) {
        addEthTransfer(callObject);
    }
    if (callObject.calls) {
        for (const _callObject of callObject.calls) {
            doProcessCall(_callObject);
        }
    }
}
function validateCall(callObject) {
    interestingInput =
        decodedInput !== undefined &&
            validFunctionNames.indexOf(decodedInput['name']) !== -1;
    hasLogs = callObject.logs != undefined;
    if (hasLogs) {
        if (callObject.logs === undefined) {
            callObject.logs = [];
        }
        callObject.logs.forEach((element) => {
            consumableLogs.push(element);
        });
    }
    if (callObject.type === 'DELEGATECALL') {
        interestingInput = false;
        hasValue = false;
    }
}
function addError(callObject, firstCall) {
    consumableErrorMsg = callObject.error;
    if (firstCall && callObject.calls === undefined) {
        if (!interestingInput && !hasValue) {
            logCompareType = unknownTransfer;
            addCall(unknownTransfer, callObject.to, callObject.from, new bignumber_js_1.default(0).toString(), unknownTransfer);
        }
    }
}
/* eslint-disable max-lines-per-function */
function addTransfer(type, callObject) {
    switch (type) {
        case transfer:
            logCompareType = transfer;
            addCall(callObject.to, decodedInput.params[0].value, callObject.from, decodedInput.params[1].value, type);
            return;
        case transferFrom:
            logCompareType = transfer;
            addCall(callObject.to, decodedInput.params[1].value, decodedInput.params[0].value, decodedInput.params[2].value, type);
            return;
        case deposit:
            if (callObject.to.toLowerCase() === knownAddresses_1.wethAddress) {
                logCompareType = deposit;
                addCall(knownAddresses_1.ethAddress, callObject.to, callObject.from, callObject.value, type);
            }
            return;
        case withdraw:
            if (callObject.to.toLowerCase() === knownAddresses_1.wethAddress) {
                logCompareType = withdraw;
                addCall(knownAddresses_1.wethAddress, callObject.to, callObject.from, decodedInput.params[0].value, decodedInput['name']);
            }
            return;
    }
}
/* eslint-enable max-lines-per-function */
function addEthTransfer(callObject) {
    logCompareType = ethTransfer;
    addCall(knownAddresses_1.ethAddress, callObject.to, callObject.from, callObject.value, ethTransfer);
}
function addCall(token, to, from, rawValue, type) {
    consumableLogs.sort(sortLogs);
    const newTxCall = {
        token: token,
        to: to,
        from: from,
        rawValue: rawValue,
        type: type,
        logCompareType: logCompareType,
    };
    checkForLogs(newTxCall);
    processedCallsArray.push(newTxCall);
}
function checkForLogs(newTxCall) {
    if (hasLogs) {
        newTxCall.logs = consumableLogs;
        consumableLogs = [];
        lastCallObjectWithLogs = newTxCall;
    }
    if (consumableErrorMsg != undefined) {
        newTxCall.error = consumableErrorMsg;
        consumableErrorMsg = '';
    }
}
function sortLogs(a, b) {
    if (a.logIndex < b.logIndex) {
        return -1;
    }
    if (a.logIndex > b.logIndex) {
        return 1;
    }
    return 0;
}
//# sourceMappingURL=callProcessor.js.map