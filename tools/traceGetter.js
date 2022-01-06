async function getTrace(txhash, web3) {
    let gethTrace = await getGethTrace(web3, txhash);
    return gethTrace;
}
  
async function getGethTrace(web3, txhash) {
    try {
        let callObject = await web3.debug.traceTransaction(txhash, {tracer: 'callTracer', reexec: 5000});
        let receipt = await web3.eth.getTransactionReceipt(txhash);
    return {callObject: callObject, receipt: receipt};
    } catch(e) {
        console.log('An error occured when getting Geth Trace ' + e);
        return null;
    }
}

module.exports = getTrace;