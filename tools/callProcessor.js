const BigNumber = require('bignumber.js');
const utility = require("./utility.js");

const ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const transfer = 'transfer';
const transferFrom = 'transferFrom';
const deposit = 'deposit';
const withdraw = 'withdraw';

const validFunctionNames = [
	transfer,
	transferFrom,
	deposit,
	withdraw
];

function processCalls(callObject, abiDecoder) {
   let processedCallsArray = [];
   doProcessCall(processedCallsArray, callObject, abiDecoder);
   return processedCallsArray
}

let consumableErrorMsg = undefined;


function doProcessCall(processedCallsArray, callObject, abiDecoder){
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
            "ethTransfer");
    }
    if(callObject.calls){
        for (const _callObject of callObject.calls) {
            doProcessCall(processedCallsArray, _callObject, abiDecoder, thisCallType);
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