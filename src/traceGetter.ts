
import {tracer} from './gethCustomTracer';
import {CallObject, Receipt} from './model';
import {ConvertReceipt as ReceiptConvert} from './receipt';
import {ConvertCallObject as CallObjectConvert} from './callObject';
import Web3 from 'web3';

export interface GethTrace {
    receipt:Receipt|null;
    callObject:CallObject|null;
    error?:string;
}

export async function getTrace(txhash:string, web3:Web3) : Promise<GethTrace> {
    let gethTrace = await getGethTrace(web3, txhash);
    return gethTrace;
}

async function getGethTrace(web3 : Web3, txhash:string) : Promise<GethTrace> {
    try {
        let callObjectData = await (web3 as any).debug.traceTransaction(txhash, {reexec: 5000,  tracer: tracer});
        let callObject : CallObject = CallObjectConvert.toCallObject(JSON.stringify(callObjectData)); 
        let receiptData = await web3.eth.getTransactionReceipt(txhash);
        let receipt : Receipt = ReceiptConvert.toReceipt(JSON.stringify(receiptData));
        return {callObject: callObject, receipt: receipt};
    } catch(e) {
        let error = 'An error occured when getting Geth Trace ' + e;
        console.log(error);
        return {callObject: null, receipt: null, error: error};
    }
}