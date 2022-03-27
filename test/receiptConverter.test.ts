import {ConvertReceipt} from '../src/jsonConverters';
import {rawReceiptData, receiptResult, corruptedRawReceiptData} from './testdata';
describe('Conversion of JSON to Receipt', () => {
    it('Convers to exptected result', () => {
        const receipt = ConvertReceipt.toReceipt(rawReceiptData);
        expect(receipt).toEqual(receiptResult);
    });
    it('fails on null data', () => {
        expect(() => {
            expect(ConvertReceipt.toReceipt(null))
        }).toThrow();
    });
    
    it('fails on corrupted data', () => {
        expect(() => {
            expect(ConvertReceipt.toReceipt(corruptedRawReceiptData))
        }).toThrow();
    })
})