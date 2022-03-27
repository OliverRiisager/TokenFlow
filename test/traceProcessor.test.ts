
import { TraceProcessor } from '../src'
import {rawTransferData, transfersNodesNoExternalTranslation, receiptResult, expectedDecodedLogsResult} from './testdata'
import {TestProvider} from './test.provider';

import abiDecoder from 'abi-decoder';
import erc20Abi from '../public/abis/erc20.json';
import wethAbi from '../public/abis/wrappedEther.json';
describe(' TraceProcessor - processing known transaction ', () => {

    let traceProcessor: TraceProcessor;
    beforeEach(() => {
        abiDecoder.addABI(erc20Abi);
        abiDecoder.addABI(wethAbi);
        const testProvider = new TestProvider();
        traceProcessor = new TraceProcessor(testProvider);
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
            }).toThrow('Transaction hash length not of proper lenghth');
        });
        it('throws error on txHash not defined', () => {
            expect(() => {
                expect(traceProcessor.getTransfers(null))
            }).toThrow('txHash not null or undefined');
        });
    });
})