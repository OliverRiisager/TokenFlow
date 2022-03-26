import BigNumber from 'bignumber.js';

import {ethAddress, wethAddress} from './knownAddresses';
import {Call, CallObject, Log, ProcessedCall} from './index';
import {Methods} from './model/methods.model';
/* eslint-disable @typescript-eslint/ban-ts-comment*/
// @ts-ignore
import abiDecoder from 'abi-decoder';
/* eslint-enable @typescript-eslint/ban-ts-comment*/

const transfer = Methods.Transfer;
const transferFrom = Methods.TransferFrom;
const deposit = Methods.Deposit;
const withdraw = Methods.Withdraw;
const ethTransfer = Methods.EthTransfer;
const unknownTransfer = Methods.Unknown;

const validFunctionNames = [transfer, transferFrom, deposit, withdraw];

let processedCallsArray: ProcessedCall[] = [];
let lastCallObjectWithLogs: ProcessedCall;
let consumableLogs: Log[] = [];
let consumableErrorMsg: string | undefined = undefined;
let logCompareType: string;
let hasValue = false;
let interestingInput = false;
let hasLogs = false;
/* eslint-disable @typescript-eslint/no-explicit-any*/
let decodedInput: any = undefined;
/* eslint-enable @typescript-eslint/no-explicit-any*/

export function processCalls(callObject: CallObject): ProcessedCall[] {
    processedCallsArray = [];
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

function doProcessCall(callObject: CallObject | Call, firstCall = false): void {
    const transactionValue = new BigNumber(callObject.value);
    hasValue = !transactionValue.isNaN() && !transactionValue.isZero();
    decodedInput = callObject.input
        ? abiDecoder.decodeMethod(callObject.input)
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

function validateCall(callObject: CallObject | Call) {
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

function addError(callObject: CallObject | Call, firstCall: boolean) {
    consumableErrorMsg = callObject.error;
    if (firstCall && callObject.calls === undefined) {
        if (!interestingInput && !hasValue) {
            logCompareType = unknownTransfer;
            addCall(
                unknownTransfer,
                callObject.to,
                callObject.from,
                new BigNumber(0).toString(),
                unknownTransfer
            );
        }
    }
}

/* eslint-disable max-lines-per-function */
function addTransfer(type: string, callObject: CallObject | Call) {
    switch (type) {
        case transfer:
            logCompareType = transfer;
            addCall(
                callObject.to,
                decodedInput.params[0].value,
                callObject.from,
                decodedInput.params[1].value,
                type
            );
            return;
        case transferFrom:
            logCompareType = transfer;
            addCall(
                callObject.to,
                decodedInput.params[1].value,
                decodedInput.params[0].value,
                decodedInput.params[2].value,
                type
            );
            return;
        case deposit:
            if (callObject.to.toLowerCase() === wethAddress) {
                logCompareType = deposit;
                addCall(
                    ethAddress,
                    callObject.to,
                    callObject.from,
                    callObject.value,
                    type
                );
            }
            return;
        case withdraw:
            if (callObject.to.toLowerCase() === wethAddress) {
                logCompareType = withdraw;
                addCall(
                    wethAddress,
                    callObject.to,
                    callObject.from,
                    decodedInput.params[0].value,
                    decodedInput['name']
                );
            }
            return;
    }
}
/* eslint-enable max-lines-per-function */

function addEthTransfer(callObject: CallObject | Call) {
    logCompareType = ethTransfer;
    addCall(
        ethAddress,
        callObject.to,
        callObject.from,
        callObject.value,
        ethTransfer
    );
}

function addCall(
    token: string,
    to: string,
    from: string,
    rawValue: string,
    type: string
): void {
    consumableLogs.sort(sortLogs);
    const newTxCall: ProcessedCall = {
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

function checkForLogs(newTxCall: ProcessedCall) {
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

function sortLogs(a: Log, b: Log): number {
    if (a.logIndex < b.logIndex) {
        return -1;
    }
    if (a.logIndex > b.logIndex) {
        return 1;
    }
    return 0;
}
