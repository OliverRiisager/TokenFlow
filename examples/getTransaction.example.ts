import Web3 from "web3";
import {TraceProcessor, Web3Provider} from '../src'

const txHash = 'Your txHash';
const nodeBaseUrl = 'Add your nodes base url here';
const yourGethNodeKey = 'Add your key here';

// eslint-disable-next-line max-len
//You can use whichever node provider you want - you just have to implement your own providerconnector.
const web3 = new Web3(nodeBaseUrl+yourGethNodeKey);

//Create instance of your provider
const web3Provider = new Web3Provider(web3);

//Create traceprocessor instance
const traceProcessor = new TraceProcessor(web3Provider);

//Call getTransfers
traceProcessor.getTransfers(txHash)
    .then(result => console.log(result));



