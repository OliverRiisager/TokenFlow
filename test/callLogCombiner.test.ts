import { insertLogs } from "../src"
import { processedCallsInput, processedLogsInput, combinedLogsAndTxs } from "./testdata"

describe('callLogcombiner tests', () => {
    it('gives expected result', () => {
        expect(insertLogs(processedLogsInput, processedCallsInput)).toEqual(combinedLogsAndTxs);
    });
    it('throws error if processedCalls is undefined', () => {
        expect(() => {
            expect(insertLogs(processedLogsInput, null))
        }).toThrowError();
    });
    it('throws error if processedLogs is undefined', () => {
        expect(() => {
            expect(insertLogs(null, processedCallsInput))
        }).toThrowError();
    })
})