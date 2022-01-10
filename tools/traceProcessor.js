const getTrace = require('./traceGetter');
const processCalls = require('./callProcessor');
const processLogs = require('./logProcessor');
const combineTxsAndLogs = require('./callLogCombiner');
const translateCallsAndLogs = require('./callLogTranslator');
const abiDecoder = require('abi-decoder');
const Web3 = require("web3");
const config = require("../config");

const erc20abi = require("../public/abis/erc20.json");
const wethAbi = require("../public/abis/wrappedEther.json");

class traceProcessor {

    constructor(){
      abiDecoder.addABI(erc20abi);
      abiDecoder.addABI(wethAbi);
      
      let web3Instance = new Web3(new Web3.providers.HttpProvider(config.httpGethProvider));
      this.web3 = this.extendWeb3(web3Instance);
      this.txs = [];

    }
    
   extendWeb3(_web3Instance) {
       _web3Instance.extend({
           property: 'debug',
           methods: [{
               name: 'traceTransaction',
               call: 'debug_traceTransaction',
               params: 2
            }]
        });
        return _web3Instance;
    }

    getTransfers(txHash){
        return this.doGetTransfers(txHash);
    }

    async doGetTransfers(txHash){
        
        this.fireProcessChangedEvent("Getting trace");
        let rawTransferData = await getTrace(txHash, this.web3);
        let callObject = rawTransferData.callObject;

        this.fireProcessChangedEvent("Start processing calls");
        let processedCalls = processCalls(callObject, abiDecoder);

        let receipt = rawTransferData.receipt;
        this.fireProcessChangedEvent("Start processing logs");
		let decodedLogs = abiDecoder.decodeLogs(receipt.logs);
        let processedLogs = processLogs(decodedLogs);

        this.fireProcessChangedEvent("Combining logs and calls");
        let combinedTxsAndLogs = combineTxsAndLogs(processedLogs, processedCalls);

        this.fireProcessChangedEvent("Translating logs and calls");
        let nodesAndTxs = await translateCallsAndLogs(combinedTxsAndLogs, this.web3, receipt.from, erc20abi);
        this.fireProcessChangedEvent("Done !");
        return nodesAndTxs;
    }

    fireProcessChangedEvent(processMessage){
        this.currentProcessMessage = processMessage;
        if(this.callbackFn !== undefined){
            this.callbackFn(processMessage);
        }
    }

    attachCallback(callbackFn){
        this.callbackFn = callbackFn;
    }
}

module.exports = traceProcessor;