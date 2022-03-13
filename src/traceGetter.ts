import {tracer} from './gethCustomTracer';
import {CallObject, Receipt, GethTrace} from './model';
import {
    ConvertReceipt,
    ConvertCallObject,
} from './jsonConverters';
import Web3 from 'web3';

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
        const callObject: CallObject = ConvertCallObject.toCallObject(
            JSON.stringify(callObjectData)
        );
        const receiptData = await web3.eth.getTransactionReceipt(txhash);
        const receipt: Receipt = ConvertReceipt.toReceipt(
            JSON.stringify(receiptData)
        );
        return {callObject: callObject, receipt: receipt};
    } catch (e) {
        const error = 'An error occured when getting Geth Trace ' + e;
        console.log(error);
        return {callObject: null, receipt: null, error: error};
    }
}
