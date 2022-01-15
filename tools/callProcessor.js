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
   return processedCallsArray
}

let consumableErrorMsg = undefined;


function doProcessCall(processedCallsArray, callObject, abiDecoder, firstCall = false){
    let transactionValue = new BigNumber(callObject.value);
    let hasValue = !transactionValue.isNaN() && !transactionValue.isZero();
    let decodedInput = callObject.input ? abiDecoder.decodeMethod(callObject.input) : undefined;
    let interestingInput = decodedInput !== undefined && validFunctionNames.indexOf(decodedInput['name']) !== -1;

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
                    unknownTransfer);
            }
        }
    }
    thisCallType = undefined;
    if(interestingInput) {
        thisCallType = decodedInput['name'];
        switch (decodedInput['name']) {
            case transfer:
                addCall(
                    processedCallsArray,
                    callObject.to,
                    decodedInput.params[0].value,
                    callObject.from,
                    decodedInput.params[1].value,
                    decodedInput['name'],
                    decodedInput['name']);
                break;
        
            case transferFrom:
                addCall(
                    processedCallsArray,
                    callObject.to,
                    decodedInput.params[1].value,
                    decodedInput.params[0].value,
                    decodedInput.params[2].value,
                    decodedInput['name'],
                    transfer);
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
                        deposit);
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
                        withdraw);
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
            ethTransfer);
    }
    if(callObject.calls){
        for (const _callObject of callObject.calls) {
            doProcessCall(processedCallsArray, _callObject, abiDecoder);
        }
    }
}

function addCall(txs, token, to, from, rawValue, type, logCompareType){
    let newTxCall = {
        token: token,
        to: to,
        from: from,
        rawValue: rawValue,
        type: type,
        logCompareType: logCompareType
    };
    if(consumableErrorMsg != undefined){
        newTxCall.error = consumableErrorMsg;
        consumableErrorMsg = undefined;
    }
    txs.push(newTxCall);
}

module.exports = processCalls;