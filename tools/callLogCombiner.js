function combineTxsAndLogs(logs, txs){
	var combinedTxAndLogs = [];
	var txsUsed = 0;
	for (let i = 0; i < logs.length; i++) {
		var logElement = logs[i];
		if(txsUsed === txs.length){
			combinedTxAndLogs.push(logElement);
			continue;
		}
		var logMatchedAnyTx = false;
		for (let i = 0; i < txs.length; i++) {
			var txElement = txs[i];
			if(txElement.isUsed){
				continue;
			}
			if(txElement.type === 'ethTransfer'){
				txElement.isUsed = true;
				combinedTxAndLogs.push(txElement);
				txsUsed++;
				continue;
			}
			if(doesLogEqualTx(txElement, logElement)){
				txElement.isUsed = true;
				combinedTxAndLogs.push(txElement);
				txsUsed++;
				logMatchedAnyTx = true;
				break;
			}
		}
		if(!logMatchedAnyTx){
			combinedTxAndLogs.push(logElement);
		}
	}
	return combinedTxAndLogs;
}

function doesLogEqualTx(tx, logInfo){
    return tx.logCompareType === logInfo.type &&
    logInfo.from === tx.from &&
    logInfo.to === tx.to &&
    logInfo.tokenAddress === tx.token &&
    logInfo.rawValue === tx.rawValue;
}

module.exports = combineTxsAndLogs;