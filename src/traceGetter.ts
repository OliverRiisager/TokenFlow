
import {tracer} from './tracer';
import * as tracerTypes from './tracerTypes';

export async function getTrace(txhash, web3) {
    let gethTrace = await getGethTrace(web3, txhash);
    return gethTrace;
}

async function getGethTrace(web3, txhash) {
    try {
        let callObjectData = await web3.debug.traceTransaction(txhash, {reexec: 5000,  tracer: tracer});
        let callObject : tracerTypes.CallObject = JSON.parse(callObjectData);
        let receipt = await web3.eth.getTransactionReceipt(txhash);
        return {callObject: callObject, receipt: receipt};
    } catch(e) {
        let error = 'An error occured when getting Geth Trace ' + e;
        console.log(error);
        return {callObject: null, receipt: null, error: error};
    }
}