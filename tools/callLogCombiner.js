const withdraw = "withdraw";
const deposit = "deposit";
const transfer = "transfer";

function combineTxsAndLogs(logs, txs){
	var combinedTxAndLogs = [...txs];
	if(logs.length === 0){
		return txs;
	}
	if(txs.length === 0){
		return logs;
	}
	var logsWithNoMatch = findLogsWithNoMatch(logs, txs);
	var insertions = 0;
	for (let i = 0; i < logsWithNoMatch.length; i++) {
		const noMatchLog = logsWithNoMatch[i];
		var logToInsert = noMatchLog.log;
		if(logToInsert.type === withdraw){
			//insert before element
			var foundIndex = txs.findIndex(x => {
				return logToInsert.type === x.logCompareType &&
				logToInsert.from === x.to &&
				logToInsert.to === x.from &&
				logToInsert.rawValue === x.rawValue;
			});
			foundIndex += insertions;
			combinedTxAndLogs.splice(foundIndex, 0, logToInsert);
			insertions++;
		}
		if(logToInsert.type === deposit){
			//insert after element
			var foundIndex = txs.findIndex(x => {
				return logToInsert.type === x.logCompareType &&
				logToInsert.from === x.to &&
				logToInsert.to === x.from &&
				logToInsert.rawValue === x.rawValue;
			});
			foundIndex += insertions + 1;
			combinedTxAndLogs.splice(foundIndex, 0, logToInsert);
			insertions++;
		}
		//Determine if the transfer requires some token and amount to find location
		if(logToInsert.type === transfer){
			if(noMatchLog.previousLog === undefined){
				//first event
			}
			if(noMatchLog.nextLog === undefined){
				//last event
			}
			var logIndexObject = findNearestLogWithMatch(noMatchLog);
			var foundIndex = txs.length;
			if(logIndexObject !== null){
				foundIndex = txs.findIndex(x => doesLogEqualTx(x, logIndexObject.matchLog.log));
			}
			foundIndex += insertions+1;
			//Check for token equality
			combinedTxAndLogs.splice(foundIndex, 0, logToInsert);
			insertions++;
		}
	}
	return combinedTxAndLogs;
}

function findLogsWithNoMatch(logs, txs){
	var noMatchLogs = [];
	var previousLog = undefined;
	for (let i = 0; i < logs.length; i++) {
		var logElement = {log: logs[i]};
		if(previousLog){
			previousLog.nextLog = logElement;
			logElement.previousLog = previousLog;
		}
		var logMatchedAnyTx = false;
		for (let i = 0; i < txs.length; i++) {
			var txElement = txs[i];
			if(txElement.isMatched){
				continue;
			}
			if(doesLogEqualTx(txElement, logElement.log)){
				txElement.isMatched = true;
				logElement.hasMatch = true;
				logMatchedAnyTx = true;
				break;
			}
		}
		if(!logMatchedAnyTx){
			logElement.hasMatch = false;
			noMatchLogs.push(logElement);
		}
		previousLog = logElement;
	}
	return noMatchLogs;
}

function doesLogEqualTx(tx, logInfo){
    return tx.logCompareType === logInfo.type &&
    logInfo.from === tx.from &&
    logInfo.to === tx.to &&
    logInfo.token === tx.token &&
    logInfo.rawValue === tx.rawValue;
}


function findNearestLogWithMatch(noMatchLog){

	var backwardsResult = noMatchLog.previousLog ? findLogWithMatchInDirection(noMatchLog) : undefined;
	var forwardsResult = noMatchLog.nextLog ? findLogWithMatchInDirection(noMatchLog, false) : undefined;

	var backwardsSteps = backwardsResult ? backwardsResult.steps : -1;
	var forwardsSteps = forwardsResult ? forwardsResult.steps : -1;

	if(backwardsSteps === -1 && forwardsSteps === -1){
		return {matchLog : noMatchLog, steps: -1};
	}
	if(backwardsSteps === forwardsSteps){
		return backwardsResult;
	}
	if(forwardsSteps < 0){
		return backwardsResult;
	}
	if(backwardsResult < 0){
		return forwardsResult;
	}
	return forwardsResult;
}

function findLogWithMatchInDirection(noMatchLog, backwards = true, steps = 0){
	var logToCheck = backwards ? noMatchLog.previousLog : noMatchLog.nextLog;
	if(logToCheck){
		steps++;
		if(logToCheck.hasMatch){
			return {matchLog : logToCheck, steps: steps};
		}else{
			return findLogWithMatchInDirection(logToCheck, steps, backwards);
		}
	}
	return {matchLog : noMatchLog, steps: steps};
}
module.exports = combineTxsAndLogs;