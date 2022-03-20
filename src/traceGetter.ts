import {tracer} from './gethCustomTracer';
import {CallObject, Receipt, GethTrace} from './model';
import {
    ConvertReceipt,
    ConvertCallObject,
} from './jsonConverters';
import { ProviderConnector } from './connector/provider.connector';

export async function getTrace(
    txhash: string, 
    providerConnector: ProviderConnector
): Promise<GethTrace> {
    const gethTrace = await getGethTrace(providerConnector, txhash);
    return gethTrace;
}

async function getGethTrace(
    providerConnector: ProviderConnector, 
    txhash: string
): Promise<GethTrace> {
    try {
        const callObjectData = await providerConnector.traceTransaction(
            txhash,
            tracer
        );
        const callObject: CallObject = ConvertCallObject.toCallObject(
            JSON.stringify(callObjectData)
        );
        const receiptData = await providerConnector.getTransactionReceipt(txhash);
        const receipt: Receipt = ConvertReceipt.toReceipt(
            JSON.stringify(receiptData)
        );
        return {callObject: callObject, receipt: receipt};
    } catch (e) {
        const error = 'An error occured when getting Geth Trace ' + e;
        return {callObject: null, receipt: null, error: error};
    }
}
