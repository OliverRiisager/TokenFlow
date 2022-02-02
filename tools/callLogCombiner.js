
const transactionAndLogTypes = require('./transactionAndLogTypes');

const transfer = transactionAndLogTypes.transfer;
const deposit = transactionAndLogTypes.deposit;
const withdraw = transactionAndLogTypes.withdraw;

function insertLogs(processedLogs, processedCalls){
	var combinedTxsAndLogs = [];
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

function combineTxsAndLogs(logs, txs){
	let combinedTxAndLogs = [...txs];
	if(logs.length === 0){
		return txs;
	}
	if(txs.length === 0){
		return logs;
	}
	let logsWithNoMatch = findLogsWithNoMatch(logs, txs);
	let insertions = 0;
	let secondPassLogs = [];
	for (let i = 0; i < logsWithNoMatch.length; i++) {
		const noMatchLog = logsWithNoMatch[i];
		let logToInsert = noMatchLog.log;
		if(logToInsert.type === withdraw){
			//insert before element
			let foundIndex = txs.findIndex(x => {
				return logToInsert.type === x.logCompareType &&
				logToInsert.from === x.to &&
				logToInsert.to === x.from &&
				logToInsert.rawValue === x.rawValue;
			});
			foundIndex += insertions;
			noMatchLog.hasMatch = true;
			combinedTxAndLogs.splice(foundIndex, 0, logToInsert);
			insertions++;
		}
		if(logToInsert.type === deposit){
			//insert after element
			let foundIndex = txs.findIndex(x => {
				return logToInsert.type === x.logCompareType &&
				logToInsert.from === x.to &&
				logToInsert.to === x.from &&
				logToInsert.rawValue === x.rawValue;
			});
			foundIndex += insertions + 1;
			noMatchLog.hasMatch = true;
			combinedTxAndLogs.splice(foundIndex, 0, logToInsert);
			insertions++;
		}
		//Determine if the transfer requires some token and amount to find location
		if(logToInsert.type === transfer){
			if(tryInsertLogTransfer(noMatchLog, combinedTxAndLogs, secondPassLogs)){
				insertions++;
			}
		}
	}
	for (let index = 0; index < secondPassLogs.length; index++) {
		const logNoMatch = secondPassLogs[index];
		if(tryInsertLogTransfer(logNoMatch, combinedTxAndLogs, secondPassLogs, true)){
			insertions++;
		}
	}
	return combinedTxAndLogs;
}

function tryInsertLogTransfer(noMatchLog, combinedTxAndLogs, secondPassLogs, secondPass = false){
	
	let logToInsert = noMatchLog.log;
	let nearestBeforeLogIndexObject = findLogWithMatchInDirection(noMatchLog, true);
	let nearestAfterLogIndexObject = findLogWithMatchInDirection(noMatchLog, false);
	let minIndex = 0;
	let maxIndex = combinedTxAndLogs.length;
	let minWithdrawals = 0;
	let maxDeposits = 0;
	let indexFound = false;
	if(nearestBeforeLogIndexObject !== undefined){
		minIndex = combinedTxAndLogs.findIndex(x => doesLogEqualAddedElement(x, nearestBeforeLogIndexObject.matchLog.log));
		minWithdrawals = nearestBeforeLogIndexObject.withdrawals;
		if(nearestBeforeLogIndexObject.matchLog.log.type === withdraw){
			minWithdrawals++;
		}
		if(minIndex >= 0){
			minIndex = minIndex + minWithdrawals;
		}
		if(minIndex === combinedTxAndLogs.length){
			foundIndex = combinedTxAndLogs.length;
			indexFound = true;
		}
	}
	if(nearestAfterLogIndexObject !== undefined){
		maxIndex = combinedTxAndLogs.findIndex(x => doesLogEqualAddedElement(x, nearestAfterLogIndexObject.matchLog.log));
		maxDeposits = nearestAfterLogIndexObject.deposits;
		if(nearestAfterLogIndexObject.matchLog.log.type === deposit){
			maxIndex--;
		}
		if(maxIndex > 0){
			maxIndex = maxIndex - maxDeposits;
		}
		if(maxIndex === 0){
			foundIndex = maxIndex;
			indexFound = true;
		}
	}
	if(!indexFound){
		if(maxIndex < 0){
			maxIndex = combinedTxAndLogs.length;
		}
		if(minIndex < 0){
			minIndex = 0;
		}
		//If the difference is one we know exactly where to place the log
		if(maxIndex - minIndex === 1){
			foundIndex = maxIndex;
		}else{
			if(secondPass){
				foundIndex = maxIndex+1;
				for (let i = minIndex; i < maxIndex; i++) {
					const element = combinedTxAndLogs[i];
					if(element.to === logToInsert.from){
						//IF we find something override the foundindex - if nothing is found it will continue to be appended using the maxIndex.
						foundIndex = i+1;
						break;
					}
				}
	
			}else{
				secondPassLogs.push(noMatchLog);
				return false;
	
			}
		}
	}
	noMatchLog.hasMatch = true;
	combinedTxAndLogs.splice(foundIndex, 0, logToInsert);
	return true;
}

function findLogsWithNoMatch(logs, txs){
	let noMatchLogs = [];
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

function doesLogEqualAddedElement(added, logInfo){
	let type = added.isLog ? added.type : added.logCompareType;
    return logInfo.type === type &&
    logInfo.from === added.from &&
    logInfo.to === added.to &&
    logInfo.token === added.token &&
    logInfo.rawValue === added.rawValue;
}

function doesLogEqualTx(tx, logInfo){
    return tx.logCompareType === logInfo.type &&
    logInfo.from === tx.from &&
    logInfo.to === tx.to &&
    logInfo.token === tx.token &&
    logInfo.rawValue === tx.rawValue;
}

function findLogWithMatchInDirection(noMatchLog, backwards = true, steps = 0, deposits = 0, withdrawals = 0){
	let logToCheck = backwards ? noMatchLog.previousLog : noMatchLog.nextLog;
	if(logToCheck){
		steps++;
		if(logToCheck.log.type === withdraw){
			withdrawals++;
		}
		if(logToCheck.log.type === deposit){
			deposits++;
		}
		if(logToCheck.hasMatch){
			return {matchLog : logToCheck, steps: steps, deposits: deposits, withdrawals: withdrawals};
		}else{
			return findLogWithMatchInDirection(logToCheck, backwards, steps, deposits, withdrawals);
		}
	}
	return steps === 0 ? undefined : {matchLog : noMatchLog, steps: steps, deposits: deposits, withdrawals: withdrawals};
}
module.exports = insertLogs;