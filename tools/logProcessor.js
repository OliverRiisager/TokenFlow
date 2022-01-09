const knownAddresses = require('./knownAddresses');

const wethAddress = knownAddresses.wethAddress;

const transactionAndLogTypes = require('./transactionAndLogTypes');

const transfer = transactionAndLogTypes.transfer;
const deposit = transactionAndLogTypes.deposit;
const withdraw = transactionAndLogTypes.withdraw;
const logWithdraw = transactionAndLogTypes.logWithdraw;

function processLogs(logs){
	let processedLogs = [];
	for (let i = 0; i < logs.length; i++) {
		let log = logs[i];
		let type = log.name.toLowerCase();
		if(type === transfer){
			let transferEvent = log.events;

            addLog(
                processedLogs,
				log.address.toLowerCase(),
				transferEvent[1].value.toLowerCase(),
				transferEvent[0].value.toLowerCase(),
				transferEvent[2].value,
				type);
            continue;
		}
		if(type === deposit){
			let depositEvent = log.events;
            addLog(
                processedLogs,
				wethAddress,
				depositEvent[0].value.toLowerCase(),
				log.address.toLowerCase(),
				depositEvent[1].value,
				type);

            continue;
		}

		if(type === logWithdraw){
			let withdrawEvent = log.events;
            addLog(
                processedLogs,
				wethAddress,
				log.address.toLowerCase(),
				withdrawEvent[0].value.toLowerCase(),
				withdrawEvent[1].value,
				withdraw);
            continue;
		}
	}
    return processedLogs;
}

function addLog(processedLogs, token, to, from, rawValue, type){
    processedLogs.push({
        token: token,
        to: to,
        from: from,
        rawValue: rawValue,
        type: type,
		isLog: true,
		logIndex: processedLogs.length
    });
}

module.exports = processLogs;