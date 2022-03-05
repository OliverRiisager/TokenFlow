import {getTrace} from './traceGetter';
import processCalls from './callProcessor';
import {processLogs} from './logProcessor';
import insertLogs from './callLogCombiner';
import translateCallsAndLogs from './callLogTranslator';
import abiDecoder from 'abi-decoder';
import Web3 from "web3";
import {configService} from './configService';

import erc20abi from "../public/abis/erc20.json";
import wethAbi from "../public/abis/wrappedEther.json";

export class traceProcessor {

    web3:any;
    txs:any;
    constructor(){
      abiDecoder.addABI(erc20abi);
      abiDecoder.addABI(wethAbi);
      
      let web3Instance = new Web3(new Web3.providers.HttpProvider(configService.getInstance().config.httpGethProvider));
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
        
        try {
            let rawTransferData = await getTrace(txHash, this.web3);
            if(rawTransferData.error !== undefined){
                throw rawTransferData.error;
            }
            let callObject = rawTransferData.callObject;
    
            let processedCalls = processCalls(callObject, abiDecoder);
    
            let receipt = rawTransferData.receipt;

            abiDecoder.keepNonDecodedLogs();
            let decodedLogs = abiDecoder.decodeLogs(receipt.logs);
            let processedLogs = processLogs(decodedLogs);
    
            var combinedTxsAndLogs =insertLogs(processedLogs, processedCalls);
    
            let nodesAndTxs = await translateCallsAndLogs(combinedTxsAndLogs, this.web3, receipt.from, erc20abi);
            return nodesAndTxs;
        }catch(e){
            console.log("Unexpected Exception : " + e);
            throw e;
        }
    }
}