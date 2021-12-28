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

var senderAddress = undefined;

function processCalls(callObject, abiDecoder) {
   var processedCallsArray = [];
   doProcessCall(processedCallsArray, callObject, abiDecoder, true);
   return {
       processedCalls: processedCallsArray,
       senderAddress
   }
}

function doProcessCall(processedCallsArray, callObject, abiDecoder, previousCallType = undefined, firstCall = false){
    let transactionValue = new BigNumber(callObject.value);
    let hasValue = !transactionValue.isNaN() && !transactionValue.isZero();
    let decodedInput = callObject.input ? abiDecoder.decodeMethod(callObject.input) : undefined;
    let interestingInput = decodedInput && validFunctionNames.indexOf(decodedInput['name']) != -1;

    if(firstCall){
        senderAddress = callObject.from;
    }
    if(callObject.type === 'DELEGATECALL'){
        interestingInput = false;
        hasValue = false;
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
                        decodedInput['name']);
                    addCall(
                        processedCallsArray,
                        wethAddress, 
                        callObject.from, 
                        callObject.to, 
                        utility.getValue(callObject.value), 
                        decodedInput['name'], 
                        decodedInput['name']);
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
                        decodedInput['name']);

                        
                    addCall(
                        processedCallsArray,
                        ethAddress, 
                        callObject.from, 
                        callObject.to, 
                        decodedInput.params[0].value, 
                        decodedInput['name'], 
                        decodedInput['name']);
                }
                break;
        }
    }
    if(hasValue && !interestingInput && previousCallType != withdraw){
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
    txs.push({
        token: token,
        to: to,
        from: from,
        rawValue: rawValue,
        type: type,
        logCompareType: logCompareType
    });
}

module.exports = processCalls;