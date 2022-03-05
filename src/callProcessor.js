const BigNumber = require('bignumber.js');
const utility = require("./utility.js");
const knownAddresses = require('./knownAddresses');
const transactionAndLogTypes = require('./transactionAndLogTypes');

const ethAddress = knownAddresses.ethAddress;
const wethAddress = knownAddresses.wethAddress;

const transfer = transactionAndLogTypes.transfer;
const transferFrom = transactionAndLogTypes.transferFrom;
const deposit = transactionAndLogTypes.deposit;
const withdraw = transactionAndLogTypes.withdraw;
const ethTransfer = transactionAndLogTypes.ethTransfer;
const unknownTransfer = transactionAndLogTypes.unknown;

let validFunctionNames = [
	transfer,
	transferFrom,
	deposit,
	withdraw
];

function processCalls(callObject, abiDecoder) {
   let processedCallsArray = [];
   doProcessCall(processedCallsArray, callObject, abiDecoder, true);
   if(consumableLogs.length > 0){
       for (let i = 0; i < consumableLogs.length; i++) {
           const notAddedLog = consumableLogs[i];
           lastCallObjectWithLogs.logs.push(notAddedLog);
       }
       lastCallObjectWithLogs.logs.sort(sortLogs);
   }
   return processedCallsArray
}

let lastCallObjectWithLogs = undefined;
let consumableLogs = [];
let consumableErrorMsg = undefined;

function doProcessCall(processedCallsArray, callObject, abiDecoder, firstCall = false){
    let transactionValue = new BigNumber(callObject.value);
    let hasValue = !transactionValue.isNaN() && !transactionValue.isZero();
    let decodedInput = callObject.input ? abiDecoder.decodeMethod(callObject.input) : undefined;
    let interestingInput = decodedInput !== undefined && validFunctionNames.indexOf(decodedInput['name']) !== -1;
    let hasLogs = callObject.logs != undefined;
    if(hasLogs){
        callObject.logs.forEach(element => {
            consumableLogs.push(element);
        });
    }
    if(callObject.type === 'DELEGATECALL'){
        interestingInput = false;
        hasValue = false;
    }
    if(callObject.error !== undefined){
        consumableErrorMsg = callObject.error;
        if(firstCall && callObject.calls === undefined){
            if(!interestingInput && !hasValue){
                addCall(
                    processedCallsArray,
                    unknownTransfer,
                    callObject.to,
                    callObject.from,
                    new BigNumber(0),
                    unknownTransfer,
                    unknownTransfer,
                    hasLogs);
            }
        }
    }
    if(interestingInput) {
        switch (decodedInput['name']) {
            case transfer:
                addCall(
                    processedCallsArray,
                    callObject.to,
                    decodedInput.params[0].value,
                    callObject.from,
                    decodedInput.params[1].value,
                    decodedInput['name'],
                    decodedInput['name'],
                    hasLogs);
                break;
        
            case transferFrom:
                addCall(
                    processedCallsArray,
                    callObject.to,
                    decodedInput.params[1].value,
                    decodedInput.params[0].value,
                    decodedInput.params[2].value,
                    decodedInput['name'],
                    transfer,
                    hasLogs);
                break;
            
            case deposit:
                if(callObject.to.toLowerCase() === wethAddress){
                    addCall(
                        processedCallsArray,
                        ethAddress, 
                        callObject.to, 
                        callObject.from, 
                        utility.getValue(callObject.value), 
                        decodedInput['name'], 
                        deposit,
                        hasLogs);
                }
                break;
        
            case withdraw:                
                if(callObject.to.toLowerCase() === wethAddress){
                    addCall(
                        processedCallsArray,
                        wethAddress, 
                        callObject.to, 
                        callObject.from, 
                        decodedInput.params[0].value, 
                        decodedInput['name'], 
                        withdraw,
                        hasLogs);
                }
                break;
        }
    }
    if(hasValue && !interestingInput){
        addCall(
            processedCallsArray,
            ethAddress,
            callObject.to,
            callObject.from,
            utility.getValue(callObject.value),
            ethTransfer,
            ethTransfer,
            hasLogs);
    }
    if(callObject.calls){
        for (const _callObject of callObject.calls) {
            doProcessCall(processedCallsArray, _callObject, abiDecoder);
        }
    }
}

function addCall(txs, token, to, from, rawValue, type, logCompareType, hasLogs){
    consumableLogs.sort(sortLogs);
    let newTxCall = {
        token: token,
        to: to,
        from: from,
        rawValue: rawValue,
        type: type,
        logCompareType: logCompareType,
    };
    if(hasLogs){
        newTxCall.logs = consumableLogs;
        consumableLogs = [];
        lastCallObjectWithLogs = newTxCall;
    }
    if(consumableErrorMsg != undefined){
        newTxCall.error = consumableErrorMsg;
        consumableErrorMsg = undefined;
    }
    txs.push(newTxCall);
}

function sortLogs( a, b ) {
    if ( a.logIndex < b.logIndex ){
        return -1;
    }
    if ( a.logIndex > b.logIndex ){
        return 1;
    }
    return 0;
    }

module.exports = processCalls;