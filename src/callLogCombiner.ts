import { ProcessedCall } from "./model";
import { ProcessedLog } from "./model";
import { Transfer } from "./model";

export function insertLogs(processedLogs : ProcessedLog[], processedCalls:ProcessedCall[]) : Transfer[]{
	var combinedTxsAndLogs: Transfer[] = [];
	let noMatchLogs = findLogsWithNoMatch(processedLogs, processedCalls);
	for (let index = 0; index < processedCalls.length; index++) {
		const element = processedCalls[index];
		combinedTxsAndLogs.push(element);
		if(element.logs === undefined || element.logs.length < 1){
			continue;
		}else{
			for (let j = 0; j < element.logs.length; j++) {
				const logIndex = element.logs[j].logIndex;
				var foundElement = noMatchLogs.find(x => x.logIndex === logIndex);
				if(foundElement != undefined){
					combinedTxsAndLogs.push(foundElement);
				}
			}
		}
	}
	return combinedTxsAndLogs;
}

function findLogsWithNoMatch(logs:ProcessedLog[], txs:ProcessedCall[]) : ProcessedLog[]{
	let noMatchLogs:ProcessedLog[] = [];
	let lastMatchIndex = 0;
	for (let i = 0; i < logs.length; i++) {
		let logMatchedAnyTx = false;
		let log = logs[i];
		for (let j = lastMatchIndex; j < txs.length; j++) {
			let txElement = txs[j];
			if(doesLogEqualTx(txElement, log)){
				lastMatchIndex = j+1;
				logMatchedAnyTx = true;
				break;
			}
		}
		if(!logMatchedAnyTx){
			noMatchLogs.push(log);
		}
	}
	return noMatchLogs;
}

function doesLogEqualTx(tx:ProcessedCall, logInfo:ProcessedLog){
    return tx.logCompareType === logInfo.type &&
    logInfo.from === tx.from &&
    logInfo.to === tx.to &&
    logInfo.token === tx.token &&
    logInfo.rawValue === tx.rawValue;
}