"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLogs = void 0;
const knownAddresses_1 = require("./knownAddresses");
const methods_model_1 = require("./model/methods.model");
const transfer = methods_model_1.Methods.Transfer;
const deposit = methods_model_1.Methods.Deposit;
const withdraw = methods_model_1.Methods.Withdraw;
const logWithdraw = methods_model_1.Methods.LogWithdraw;
const processedLogs = [];
let logIndex;
/* eslint-disable max-lines-per-function */
function processLogs(logs) {
    for (let i = 0; i < logs.length; i++) {
        logIndex = i;
        const log = logs[i];
        if (log == undefined) {
            continue;
        }
        const type = log.name.toLowerCase();
        if (type === transfer) {
            const transferEvent = log.events;
            addLog(log.address.toLowerCase(), transferEvent[1].value.toLowerCase(), transferEvent[0].value.toLowerCase(), transferEvent[2].value, type);
            continue;
        }
        if (type === deposit) {
            const depositEvent = log.events;
            addLog(knownAddresses_1.wethAddress, depositEvent[0].value.toLowerCase(), log.address.toLowerCase(), depositEvent[1].value, type);
            continue;
        }
        if (type === logWithdraw) {
            const withdrawEvent = log.events;
            addLog(knownAddresses_1.wethAddress, log.address.toLowerCase(), withdrawEvent[0].value.toLowerCase(), withdrawEvent[1].value, withdraw);
            continue;
        }
    }
    return processedLogs;
}
exports.processLogs = processLogs;
/* eslint-enable max-lines-per-function */
function addLog(token, to, from, rawValue, type) {
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
//# sourceMappingURL=logProcessor.js.map