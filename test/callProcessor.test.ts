import { processCalls } from "../src"
import { rawTransferData, processedCallsResult as processedCallsExpectedResult } from "./testdata"
import abiDecoder from 'abi-decoder';
import erc20Abi from '../public/abis/erc20.json';
import wethAbi from '../public/abis/wrappedEther.json';
describe('callprocessor returns proper values', () => {
    abiDecoder.addABI(erc20Abi);
    abiDecoder.addABI(wethAbi);
    it('returns expected result', () => {
        const processCallsResult = processCalls(rawTransferData.callObject);
        expect(processCallsResult.length === processedCallsExpectedResult.length).toBe(true);
        expect(processCallsResult).toEqual(processedCallsExpectedResult);
    });
    
    it('throws error on null input', () => {
        expect(() => {
            processCalls(null)
        }).toThrowError();
    });
});