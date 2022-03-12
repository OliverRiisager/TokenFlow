import {tracer} from './gethCustomTracer';
import {CallObject, Receipt} from './model';
import {
    ConvertReceipt as ReceiptConvert,
    ConvertCallObject as CallObjectConvert,
} from './jsonConverters';
import Web3 from 'web3';

export interface GethTrace {
    receipt: Receipt | null;
    callObject: CallObject | null;
    error?: string;
}

export async function getTrace(txhash: string, web3: Web3): Promise<GethTrace> {
    const gethTrace = await getGethTrace(web3, txhash);
    return gethTrace;
}

async function getGethTrace(web3: Web3, txhash: string): Promise<GethTrace> {
    try {
        /* eslint-disable */
        // @ts-ignore
        const callObjectData = await (web3 as any).debug.traceTransaction(
            txhash,
            {reexec: 5000, tracer: tracer}
        );
        /* eslint-enable */
        const callObject: CallObject = CallObjectConvert.toCallObject(
            JSON.stringify(callObjectData)
        );
        const receiptData = await web3.eth.getTransactionReceipt(txhash);
        const receipt: Receipt = ReceiptConvert.toReceipt(
            JSON.stringify(receiptData)
        );
        return {callObject: callObject, receipt: receipt};
    } catch (e) {
        const error = 'An error occured when getting Geth Trace ' + e;
        console.log(error);
        return {callObject: null, receipt: null, error: error};
    }
}
