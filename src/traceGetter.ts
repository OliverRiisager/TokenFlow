import {tracer} from './gethCustomTracer';
import {GethTrace} from './model';
import {ProviderConnector} from './connector/provider.connector';

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
        const callObject = await providerConnector.traceTransaction(
            txhash,
            tracer
        );
        const receipt = await providerConnector.getTransactionReceipt(txhash);
        return {callObject: callObject, receipt: receipt};
    } catch (e) {
        const error = 'An error occured when getting Geth Trace ' + e;
        return {callObject: null, receipt: null, error: error};
    }
}
