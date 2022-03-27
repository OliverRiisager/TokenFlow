import { translateCallsAndLogs } from "../src"
import { combinedLogsAndTxs, senderAddress, transfersNodesNoExternalTranslation } from './testdata';
import {TestProvider} from './test.provider';

describe('callLogTranslater tests', () => {
    let providerConnector: TestProvider;
    beforeEach(() => {
        providerConnector = new TestProvider();
    })
    it('translates known addresses', () => {
        expect(translateCallsAndLogs(combinedLogsAndTxs, new TestProvider(), senderAddress).then((result) => {
            expect(result).toEqual(transfersNodesNoExternalTranslation);
        }));
    })
})