import BigNumber from 'bignumber.js';

import { ethAddress, wethAddress } from './knownAddresses';
import { Call, CallObject, Log, ProcessedCall } from './index';
import { Methods } from './model/methods.model';

const transfer = Methods.Transfer;
const transferFrom = Methods.TransferFrom;
const deposit = Methods.Deposit;
const withdraw = Methods.Withdraw;
const ethTransfer = Methods.EthTransfer;
const unknownTransfer = Methods.Unknown;

let validFunctionNames = [
	transfer,
	transferFrom,
	deposit,
	withdraw
];

export function processCalls(callObject : CallObject, abiDecoder : any) : ProcessedCall[] {
   let processedCallsArray:ProcessedCall[] = [];
   doProcessCall(processedCallsArray, callObject, abiDecoder, true);
   
   if(lastCallObjectWithLogs.logs === undefined){
    lastCallObjectWithLogs.logs = [];
   }
   if(consumableLogs.length > 0){
       for (let i = 0; i < consumableLogs.length; i++) {
           const notAddedLog = consumableLogs[i];
           lastCallObjectWithLogs.logs.push(notAddedLog);
       }
       lastCallObjectWithLogs.logs.sort(sortLogs);
   }
   return processedCallsArray;
}

let lastCallObjectWithLogs:ProcessedCall;
let consumableLogs:Log[] = [];
let consumableErrorMsg :any = undefined;

function doProcessCall(processedCallsArray:ProcessedCall[], callObject : CallObject | Call, abiDecoder:any, firstCall = false) : void{
    let transactionValue = new BigNumber(callObject.value);
    let hasValue = !transactionValue.isNaN() && !transactionValue.isZero();
    let decodedInput = callObject.input ? abiDecoder.decodeMethod(callObject.input) : undefined;
    let interestingInput = decodedInput !== undefined && validFunctionNames.indexOf(decodedInput['name']) !== -1;
    let hasLogs = callObject.logs != undefined;
    if(hasLogs){
        if(callObject.logs === undefined){
            callObject.logs = [];
        }
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
                    new BigNumber(0).toString(),
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
                        callObject.value,
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
            callObject.value,
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

function addCall(txs : ProcessedCall[], token:string, to:string, from:string, rawValue:string, type:string, logCompareType:string, hasLogs:boolean) : void{
    consumableLogs.sort(sortLogs);
    let newTxCall:ProcessedCall = {
        token: token,
        to: to,
        from: from,
        rawValue: rawValue,
        type: type,
        logCompareType: logCompareType
    };
    if(hasLogs){
        newTxCall.logs = consumableLogs;
        consumableLogs = [];
        lastCallObjectWithLogs = newTxCall;
    }
    if(consumableErrorMsg != undefined){
        newTxCall.error = consumableErrorMsg;
        consumableErrorMsg = "";
    }
    txs.push(newTxCall);
}

function sortLogs( a:Log, b:Log) : number {
    if ( a.logIndex < b.logIndex ){
        return -1;
    }
    if ( a.logIndex > b.logIndex ){
        return 1;
    }
    return 0;
}
