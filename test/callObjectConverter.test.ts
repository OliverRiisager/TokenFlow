import {ConvertCallObject} from '../src/jsonConverters';
import {callObjectTestData, corruptedCallObjectTestData, expectedCallObjectResult} from './testdata';
describe('Conversion of JSON to CallObject', () => {
    it('Converts to exptected result', () => {
        const callObject = ConvertCallObject.toCallObject(callObjectTestData);
        callObject.time = "time"; //Ignore the time
        expect(callObject).toEqual(expectedCallObjectResult);
    });
    it('throws error on null data', () => {
        expect(() => {
            expect(ConvertCallObject.toCallObject(null))
        }).toThrow();
    });
    
    it('throws error on corrupted data', () => {
        expect(() => {
            expect(ConvertCallObject.toCallObject(corruptedCallObjectTestData))
        }).toThrow();
    })
})