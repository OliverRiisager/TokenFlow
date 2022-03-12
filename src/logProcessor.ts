import {wethAddress} from './knownAddresses';

import {Methods} from './model/methods.model';
import {ProcessedLog} from './model/processedLog.model';
import {DecodedLog} from './model';

const transfer = Methods.Transfer;
const deposit = Methods.Deposit;
const withdraw = Methods.Withdraw;
const logWithdraw = Methods.LogWithdraw;
const processedLogs: ProcessedLog[] = [];
let logIndex: number;

/* eslint-disable max-lines-per-function */
export function processLogs(logs: (DecodedLog | null)[]): ProcessedLog[] {
    for (let i = 0; i < logs.length; i++) {
        logIndex = i;
        const log = logs[i];
        if (log == undefined) {
            continue;
        }
        const type = log.name.toLowerCase();
        if (type === transfer) {
            const transferEvent = log.events;
            addLog(
                log.address.toLowerCase(),
                transferEvent[1].value.toLowerCase(),
                transferEvent[0].value.toLowerCase(),
                transferEvent[2].value,
                type
            );
            continue;
        }
        if (type === deposit) {
            const depositEvent = log.events;
            addLog(
                wethAddress,
                depositEvent[0].value.toLowerCase(),
                log.address.toLowerCase(),
                depositEvent[1].value,
                type
            );
            continue;
        }

        if (type === logWithdraw) {
            const withdrawEvent = log.events;
            addLog(
                wethAddress,
                log.address.toLowerCase(),
                withdrawEvent[0].value.toLowerCase(),
                withdrawEvent[1].value,
                withdraw
            );
            continue;
        }
    }
    return processedLogs;
}
/* eslint-enable max-lines-per-function */

function addLog(
    token: string,
    to: string,
    from: string,
    rawValue: string,
    type: string
): void {
    processedLogs.push({
        token: token,
        to: to,
        from: from,
        rawValue: rawValue,
        type: type,
        isLog: true,
        logIndex: logIndex,
    });
}
