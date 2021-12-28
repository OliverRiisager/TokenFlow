
const ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

function processLogs(logs){
	let processedLogs = [];
	for (let i = 0; i < logs.length; i++) {
		let log = logs[i];
		var type = log.name.toLowerCase();
		if(type === 'transfer'){
			var transferEvent = log.events;

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
			var depositEvent = log.events;

            addLog(
                processedLogs,
				ethAddress,
				log.address.toLowerCase(),
				depositEvent[0].value.toLowerCase(),
				depositEvent[1].value,
				type);

            addLog(
                processedLogs,
				log.address.toLowerCase(),
				depositEvent[0].value.toLowerCase(),
				log.address.toLowerCase(),
				depositEvent[1].value,
				type);

            continue;
		}

		if(type === 'withdrawal'){
			var withdrawEvent = log.events;
            addLog(
                processedLogs,
				log.address.toLowerCase(),
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
        type: type
    });
}

module.exports = processLogs;