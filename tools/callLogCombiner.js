const withdraw = "withdraw";
const deposit = "deposit";
const transfer = "transfer";
const ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

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
			combinedTxAndLogs.splice(foundIndex, 0, logToInsert);
			insertions++;
		}
		//Determine if the transfer requires some token and amount to find location
		if(logToInsert.type === transfer){
			let nearestBeforeLogIndexObject = findLogWithMatchInDirection(noMatchLog, true);
			let nearestAfterLogIndexObject = findLogWithMatchInDirection(noMatchLog, false);
			let minIndex = 0;
			let maxIndex = combinedTxAndLogs.length;
			let minDeposits = 0;
			let minWithdrawals = 0;
			let maxDeposits = 0;
			let maxWithdrawals = 0;
			if(nearestBeforeLogIndexObject !== null){
				minIndex = combinedTxAndLogs.findIndex(x => doesLogEqualAddedElement(x, nearestBeforeLogIndexObject.matchLog.log));
				minDeposits = nearestBeforeLogIndexObject.deposits;
				minWithdrawals = nearestBeforeLogIndexObject.withdrawals;
				if(nearestBeforeLogIndexObject.matchLog.log.type === withdraw){
					minWithdrawals++;
				}
				if(minIndex >= 0){
					minIndex = minIndex + minWithdrawals;
				}
			}
			if(nearestAfterLogIndexObject !== null){
				maxIndex = combinedTxAndLogs.findIndex(x => doesLogEqualAddedElement(x, nearestAfterLogIndexObject.matchLog.log));
				maxDeposits = nearestAfterLogIndexObject.deposits;
				maxWithdrawals = nearestAfterLogIndexObject.withdrawals;
				if(nearestAfterLogIndexObject.matchLog.log.type === deposit){
					maxIndex--;
				}
				if(maxIndex >= 0){
					maxIndex = maxIndex - maxDeposits;
				}
			}
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
				//Store indexes found up until now
				let newMin = minIndex;
				let newMax = maxIndex;
				//Look through the range and shrink it in case any logs show up with greater or smaller log indexes.
				//This can happen when adding no match logs.
				for (let i = minIndex; i < maxIndex; i++) {
					const element = combinedTxAndLogs[i];
					if(element.isLog){
						if(element.logIndex < logToInsert.logIndex){
							newMin++;
						}
						if(element.logIndex > logToInsert.logIndex){
							newMax--;
						}
					}
				}
				//If this results in a difference of 1, we know exactly where to place the log element
				if(newMax - newMin === 1){
					foundIndex = maxIndex;
				}else{
					//We have some elements in between that are not logs - figure out how to properly process these
						//Attempt to check for token similarities etc.
						console.log("HEHE");
				}
			}
			// let previousLogIndexObject = logIndexObject.matchLog.previousLog;

			// let foundIndex = txs.length;
			// if(logIndexObject !== null){
			// 	foundIndex = txs.findIndex(x => doesLogEqualTx(x, logIndexObject.matchLog.log));
			// 	maxIndex = txs.findIndex(x => doesLogEqualTx())
			// 	if(foundIndex !== -1){
			// 		if(logIndexObject.matchLog.log.type === withdraw){
			// 			foundIndex++;
			// 		}
			// 		else if(txs[foundIndex-1].type === "ethTransfer"){
			// 			foundIndex++;
			// 		}
			// 	}
			// }
			// foundIndex += insertions;
			//Check for token equality
			combinedTxAndLogs.splice(foundIndex, 0, logToInsert);
			insertions++;
		}
	}
	return combinedTxAndLogs;
}

function findLogsWithNoMatch(logs, txs){
	let noMatchLogs = [];
	let previousLog = undefined;
	for (let i = 0; i < logs.length; i++) {
		let logElement = {log: logs[i]};
		if(previousLog){
			previousLog.nextLog = logElement;
			logElement.previousLog = previousLog;
		}
		let logMatchedAnyTx = false;
		for (let i = 0; i < txs.length; i++) {
			let txElement = txs[i];
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

function findNearestLogWithMatch(noMatchLog){

	let backwardsResult = noMatchLog.previousLog ? findLogWithMatchInDirection(noMatchLog) : undefined;
	let forwardsResult = noMatchLog.nextLog ? findLogWithMatchInDirection(noMatchLog, false) : undefined;

	let backwardsSteps = backwardsResult ? backwardsResult.steps : -1;
	let forwardsSteps = forwardsResult ? forwardsResult.steps : -1;

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
	return steps = 0 ? undefined : {matchLog : noMatchLog, steps: steps, deposits: deposits, withdrawals: withdrawals};
}
module.exports = combineTxsAndLogs;