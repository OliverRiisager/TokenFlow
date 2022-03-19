"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertLogs = void 0;
function insertLogs(processedLogs, processedCalls) {
    const combinedTxsAndLogs = [];
    const noMatchLogs = findLogsWithNoMatch(processedLogs, processedCalls);
    for (let index = 0; index < processedCalls.length; index++) {
        const element = processedCalls[index];
        combinedTxsAndLogs.push(element);
        if (!tryAddLogs(element, noMatchLogs, combinedTxsAndLogs)) {
            continue;
        }
    }
    return combinedTxsAndLogs;
}
exports.insertLogs = insertLogs;
function tryAddLogs(processedCall, noMatchLogs, combinedTxsAndLogs) {
    if (processedCall.logs === undefined || processedCall.logs.length < 1) {
        return false;
    }
    else {
        for (let j = 0; j < processedCall.logs.length; j++) {
            const logIndex = processedCall.logs[j].logIndex;
            const foundElement = noMatchLogs.find((x) => x.logIndex === logIndex);
            if (foundElement != undefined) {
                combinedTxsAndLogs.push(foundElement);
            }
        }
        return true;
    }
}
function findLogsWithNoMatch(logs, txs) {
    const noMatchLogs = [];
    let lastMatchIndex = 0;
    for (let i = 0; i < logs.length; i++) {
        let logMatchedAnyTx = false;
        const log = logs[i];
        for (let j = lastMatchIndex; j < txs.length; j++) {
            const txElement = txs[j];
            if (doesLogEqualTx(txElement, log)) {
                lastMatchIndex = j + 1;
                logMatchedAnyTx = true;
                break;
            }
        }
        if (!logMatchedAnyTx) {
            noMatchLogs.push(log);
        }
    }
    return noMatchLogs;
}
function doesLogEqualTx(tx, logInfo) {
    return (tx.logCompareType === logInfo.type &&
        logInfo.from === tx.from &&
        logInfo.to === tx.to &&
        logInfo.token === tx.token &&
        logInfo.rawValue === tx.rawValue);
}
//# sourceMappingURL=callLogCombiner.js.map