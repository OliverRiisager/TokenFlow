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
      
      var web3Instance = new Web3(new Web3.providers.HttpProvider(config.httpGethProvider));
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
        
        var rawTransferData = await getTrace(txHash, this.web3);
        var callObject = rawTransferData.callObject;

        var processCallsResult = processCalls(callObject, abiDecoder);

        var senderAddress = processCallsResult.senderAddress;
        var processedCalls = processCallsResult.processedCalls;

        var receipt = rawTransferData.receipt;
		let decodedLogs = abiDecoder.decodeLogs(receipt.logs);
        var processedLogs = processLogs(decodedLogs);

        var combinedTxsAndLogs = combineTxsAndLogs(processedLogs, processedCalls);

        var nodesAndTxs = await translateCallsAndLogs(combinedTxsAndLogs, this.web3, receipt.from, erc20abi);
        return nodesAndTxs;
    }
}

module.exports = traceProcessor;