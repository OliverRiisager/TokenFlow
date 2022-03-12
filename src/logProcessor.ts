import {wethAddress} from './knownAddresses';

import {Methods} from './model/methods.model';
import {ProcessedLog} from './model/processedLog.model';
import {DecodedLog} from './model';

const transfer = Methods.Transfer;
const deposit = Methods.Deposit;
const withdraw = Methods.Withdraw;
const logWithdraw = Methods.LogWithdraw;

export function processLogs(logs: (DecodedLog | null)[]): ProcessedLog[] {
    let processedLogs: ProcessedLog[] = [];
    for (let i = 0; i < logs.length; i++) {
        let log = logs[i];
        if (log == undefined) {
            continue;
        }
        let type = log.name.toLowerCase();
        if (type === transfer) {
            let transferEvent = log.events;
            addLog(
                processedLogs,
                log.address.toLowerCase(),
                transferEvent[1].value.toLowerCase(),
                transferEvent[0].value.toLowerCase(),
                transferEvent[2].value,
                type,
                i
            );
            continue;
        }
        if (type === deposit) {
            let depositEvent = log.events;
            addLog(
                processedLogs,
                wethAddress,
                depositEvent[0].value.toLowerCase(),
                log.address.toLowerCase(),
                depositEvent[1].value,
                type,
                i
            );

            continue;
        }

        if (type === logWithdraw) {
            let withdrawEvent = log.events;
            addLog(
                processedLogs,
                wethAddress,
                log.address.toLowerCase(),
                withdrawEvent[0].value.toLowerCase(),
                withdrawEvent[1].value,
                withdraw,
                i
            );
            continue;
        }
    }
    return processedLogs;
}

function addLog(
    processedLogs: ProcessedLog[],
    token: string,
    to: string,
    from: string,
    rawValue: string,
    type: string,
    logIndex: number
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
