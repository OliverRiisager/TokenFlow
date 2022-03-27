
import Web3 from 'web3';
import { httpGethProvider } from '../config';
import { TraceProcessor, Web3Provider } from '../src'
import {rawTransferData, transfersNodesNoExternalTranslation, receiptResult, expectedDecodedLogsResult} from './testdata'

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
                expect(result).toEqual(transfersNodesNoExternalTranslation);
            });
        })
        it('failes on error contained in rawTransferData', () => {
            traceProcessor.getDecodedTrace({receipt:null, callObject:null, error:"NULL TEST"}).catch(e => {
                expect(e).toEqual("NULL TEST");
            })
        });
    });

    describe('Get Decoded logs', () => {
        it('matches expected data', () => {
            expect(traceProcessor.getDecodeLogs(receiptResult)).toEqual(expectedDecodedLogsResult);
        });
        it('throws error on null data', () => {
            expect(() => {
                expect(traceProcessor.getDecodeLogs(null))
            }).toThrow('receipt was null');
        });
    });

    describe('getTransfers fails on wrong txHash', () => {
        it('throws error on txHash length not 66', () => {
            expect(() => {
                expect(traceProcessor.getTransfers("123123"))
            }).toThrow('Transaction hash length not matching');
        });
        it('throws error on txHash not defined', () => {
            expect(() => {
                expect(traceProcessor.getTransfers(null))
            }).toThrow('txHash not null or undefined');
        });
    });
})