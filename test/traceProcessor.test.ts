
import Web3 from 'web3';
import { httpGethProvider } from '../config';
import { TraceProcessor, Web3Provider } from '../src'
import {rawTransferData, nodesAndTxs} from '.'

describe(' TraceProcessor - processing known transaction ', () => {

    let traceProcessor: TraceProcessor;
    beforeEach(() => {
        const web3 = new Web3(new Web3.providers.HttpProvider(httpGethProvider));
        const web3Provider = new Web3Provider(web3);
        traceProcessor = new TraceProcessor(web3Provider);
    });
    
    describe('Normal trace ', () => {
        it('matches expected data', () => {
            traceProcessor.getDecodedTrace(rawTransferData).then( result => {
                expect(result).toEqual(nodesAndTxs);
            });
        })
        it('failes on error contained in rawTransferData', () => {
            let res = traceProcessor.getDecodedTrace({receipt:null, callObject:null, error:"NULL TEST"}).catch(e => {
                expect(e).toEqual(new Error("NULL TEST"));
            });
            return res;
        });
    });

})