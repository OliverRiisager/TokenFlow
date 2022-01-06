
const ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

function processLogs(logs){
	let processedLogs = [];
	for (let i = 0; i < logs.length; i++) {
		let log = logs[i];
		let type = log.name.toLowerCase();
		if(type === 'transfer'){
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
		if(type === 'deposit'){
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

		if(type === 'withdrawal'){
			let withdrawEvent = log.events;
            addLog(
                processedLogs,
				wethAddress,
				log.address.toLowerCase(),
				withdrawEvent[0].value.toLowerCase(),
				withdrawEvent[1].value,
				'withdraw');
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