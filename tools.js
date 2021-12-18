const Web3 = require("web3");
const abiDecoder = require('abi-decoder');
const BigNumber = require('bignumber.js');

const erc20abi = require("./public/abis/erc20.json");
const wethAbi = require("./public/abis/wrappedEther.json");

const tokenAddressToName = {
	'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' : { symbol: 'WETH', decimals:18 },
	'0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' : { symbol: 'ETH', decimals:18 },
	'0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2' : { symbol: 'MKR', decimals:18 }
};
const contractAddressToName = {
    "0x0000000000000000000000000000000000000000": "Address zero",
	"0x11111254369792b2ca5d084ab5eea397ca8fa48b": "1inch.exchange",
	"0x111111125434b319222cdbf8c261674adb56f3ae": "1inch.exchange v2",
	"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH contract",
	"0x7c66550c9c730b6fdd4c03bc2e73c5462c5f7acc": "Kyber: Contract 2",
	"0x9aab3f75489902f3a48495025729a0af77d4b11e": "Kyber: Proxy 2",
	"0xd3d2b5643e506c6d9b7099e9116d7aaa941114fe": "Kyber: Fee Handler",
	"0xa5407eae9ba41422680e2e00537571bcc53efbfd": "Curve.fi: sUSD v2 Swap",
	"0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7": "Curve.fi: DAI/USDC/USDT Pool",
	"0xc409d34accb279620b1acdc05e408e287d543d17": "Balancer: WBTC/renBTC/ETH 45/35/20 #2",
	"0xee9a6009b926645d33e10ee5577e9c8d3c95c165": "Balancer: WBTC/ETH 50/50 #5",
	"0x221bf20c2ad9e5d7ec8a9d1991d8e2edcfcb9d6c": "Balancer: WBTC/ETH 50/50 #9",
	"0x8b6e6e7b5b3801fed2cafd4b22b8a16c2f2db21a": "Balancer: DAI/ETH 20/80",
	"0xa478c2975ab1ea89e8196811f51a7b7ade33eb11": "Uniswap V2: DAI 2",
	"0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852": "Uniswap V2: USDT 2",
	"0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc": "Uniswap V2: USDC 3",
	"0x2fdbadf3c4d5a8666bc06645b8358ab803996e28": "Uniswap V2: YFI 8",
	"0x81fbef4704776cc5bba0a5df3a90056d2c6900b3": "Uniswap V2: renBTC 2",
	"0xbb2b8038a1640196fbe3e38816f3e67cba72d940": "Uniswap V2: WBTC 2",
	"0xceff51756c56ceffca006cd410b03ffc46dd3a58": "SushiSwap V2: WBTC",
	"0x06da0fd433c1a5d7a4faa01111c044910a184553": "SushiSwap V2: USDT",
	"0xa1d7b2d891e3a1f9ef4bbc5be20630c2feb1c470": "SushiSwap V2: SNX",
	"0x088ee5007c98a9677165d78dd2109ae4a3d04d0c": "SushiSwap: YFI",
};

var senderAddress = undefined;

var config = require("./config");

var functionNamesColl = [
	'transfer',
	'transferFrom',
	'deposit',
	'withdraw'
];

module.exports.getTransfers = function(txhash) {
	abiDecoder.addABI(erc20abi);
	abiDecoder.addABI(wethAbi);
	
	let web3 = new Web3(new Web3.providers.HttpProvider(config.archiveNodeHostErigon));
	web3 = extendWeb3(web3);
	return gethTrace(web3, txhash);
	
}

function extendWeb3(_web3Instance) {
	_web3Instance.extend({
	  property: 'debug',
	  methods: [{
		name: 'traceTransaction',
		call: 'debug_traceTransaction',
		params: 2
	  }]
	});

	return _web3Instance;
  }

  var bruh = [];
 async function gethTrace(web3, txhash) {

	let txs = [];

	try {
		let callObject = await web3.debug.traceTransaction(txhash, {tracer: 'callTracer', reexec: 5000});
		let receipt = await web3.eth.getTransactionReceipt(txhash);
		let logs = abiDecoder.decodeLogs(receipt.logs);
		await findInterestingCalls(txs, callObject, web3, true);
		txs = combineCallsWithLogs(txs, logs);

		console.log(JSON.stringify(bruh));
	} catch(e) {
		console.log('Fucky wucky ' + e);
	}

	let nodes = [];
	let tokenAddresses = [];

	txs.forEach(element => {
		if(nodes.indexOf(element.from) === -1){
			nodes.push(element.from);
		}
		if(nodes.indexOf(element.to) === -1){
			nodes.push(element.to);
		}
		if(tokenAddresses.indexOf(element.token) === -1){
			tokenAddresses.push(element.token);
		}
	});

	try {
		await mapAddressesToNames(tokenAddresses, nodes, web3);
	} catch(e) {
		console.log('Fucky wucky ' + e);
	}

	nodes = nodes.map((node, i) => {
		return {
			address: node,
			name : node === senderAddress ? 'sender' : contractAddressToName[node]
		}
	});

	txs.forEach(tx => {
		tx.tokenName = tokenAddressToName[tx.token].symbol;
		tx.value = getValue(tx.rawValue, tokenAddressToName[tx.token].decimals, true);
	});

	return 	{
		transfers: txs,
		nodes: nodes
	}
}

async function mapAddressesToNames(tokenAddresses, contractAddresses, web3) {
	let batch = new web3.BatchRequest();

	let tokenCallObjects = [];
	
	for (const tokenAddress of tokenAddresses) {
		if(!tokenAddressToName.hasOwnProperty(tokenAddress)) {
			let erc20Contract = await new web3.eth.Contract(erc20abi, tokenAddress);
			let symbolCall = erc20Contract.methods.symbol().call;
			let decimalsCall = erc20Contract.methods.decimals().call;
			tokenCallObjects.push({address: tokenAddress, symbolCall: symbolCall, decimalCall: decimalsCall});
		}
	}

	let contractCallObjects = [];

	for (const contractAddress of contractAddresses) {
		if(!contractAddressToName.hasOwnProperty(contractAddress)) {
			let erc20Contract = await new web3.eth.Contract(erc20abi, contractAddress);
			let nameCall = erc20Contract.methods.name().call;
			contractCallObjects.push({address: contractAddress, nameCall: nameCall});
		}
	}

	if (tokenCallObjects.length == 0 && contractCallObjects.length == 0) {
		return;
	}

	let tokenPromises = [];
	for (const tokenCallObject of tokenCallObjects) {
		pushPromise(tokenPromises, tokenCallObject.symbolCall, batch, tokenCallObject.address);
		pushPromise(tokenPromises, tokenCallObject.decimalCall, batch, 18);
	}
	let contractPromises = [];
	for (const contractCallObject of contractCallObjects) {
		pushPromise(contractPromises, contractCallObject.nameCall, batch, contractCallObject.address);
	}

	batch.execute();

	let tokenInformation = await resolvePromises(tokenPromises);
	let contractInformation = await resolvePromises(contractPromises);

	let tokenIndex = 0;
	for (let i = 0; i < tokenCallObjects.length; i++) {
		tokenAddressToName[tokenCallObjects[i].address] = { symbol: tokenInformation[tokenIndex], decimals: tokenInformation[tokenIndex+1] };
		tokenIndex = tokenIndex + 2;
	}
	for (let i = 0; i < contractCallObjects.length; i++) {
		contractAddressToName[contractCallObjects[i].address] = contractInformation[i];
	}
	return true;
}

function pushPromise(promises, call, batch, backup = null) {
	promises.push(new Promise((res, rej) => {
		let req = call.request({}, "latest", (err, data) => {
			if (err){
				rej({err, backup});
			}
			else {
				res(data);
			};
		});
		batch.add(req);
	}));
}

async function resolvePromises(promises){
	return Promise.all(
		promises.map((p) => {
			return p.catch((e) => {
				return e.backup ? e.backup : 'unknown';
			});
		})
	);
}

function getValue(value, decimals, cutOff = false) {
	if(!decimals){
		return new BigNumber(value).toString();
	}
	let s = "1e" + decimals;
	let x = new BigNumber(value);
	let temp =  BigNumber(x.div(s));
	if(cutOff){
		temp = BigNumber(temp.toFixed(3));
	}
	return temp.toNumber();
}

async function findInterestingCalls(txs, callObject, web3, firstCall = false) {
	let transactionValue = new BigNumber(callObject.value);
	let hasValue = !transactionValue.isNaN() && !transactionValue.isZero();
	let decodedInput = callObject.input ? abiDecoder.decodeMethod(callObject.input) : undefined;
	let interestingInput = decodedInput && functionNamesColl.indexOf(decodedInput['name']) != -1;

	if(firstCall){
		senderAddress = callObject.from;
	}
	if(callObject.type === 'DELEGATECALL'){
		interestingInput = false;
		hasValue = false;
	}
	if(interestingInput) {
		var hehe = {...callObject};
		hehe.calls = null;
		hehe.input = decodedInput;
		bruh.push(hehe);
		switch (decodedInput['name']) {
			case 'transfer':
				txs.push({
					token: callObject.to,
					to: decodedInput.params[0].value,
					from: callObject.from,
					rawValue: decodedInput.params[1].value,
					type: decodedInput['name'],
					logCompareType: decodedInput['name']
				});
				break;
		
			case 'transferFrom':
				txs.push({
					token: callObject.to,
					to: decodedInput.params[1].value,
					from: decodedInput.params[0].value,
					rawValue: decodedInput.params[2].value,
					type: decodedInput['name'],
					logCompareType: 'transfer'
				});
				break;
			
			case 'deposit':
				if(callObject.to.toLowerCase() === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'){
					// var namesObj = await getNamesFromAddresses(null, callObject.from, null, web3, wethAbi)
					txs.push({
						token: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
						to: callObject.to,
						from: callObject.from,
						rawValue: getValue(callObject.value),
						type: decodedInput['name'],
						logCompareType: decodedInput['name']
					});
					txs.push({
						token: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
						to: callObject.from,
						from: callObject.to,
						rawValue: getValue(callObject.value),
						type: decodedInput['name'],
						logCompareType: decodedInput['name']
					});
				}
				break;
		
			case 'withdraw':
				if(callObject.to.toLowerCase() === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'){
					// var namesObj = await getNamesFromAddresses(null, callObject.from, null, web3, wethAbi)
					txs.push({
						token: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
						to: callObject.to,
						from: callObject.from,
						rawValue: decodedInput.params[0].value,
						type: decodedInput['name'],
						logCompareType: decodedInput['name']
					});
				}
				break;
		}
	}
	if(hasValue && !interestingInput){
		// var namesObj = await getNamesFromAddresses(null, callObject.from, callObject.to, web3);
		txs.push({
			token: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
			to: callObject.to,
			from: callObject.from,
			rawValue: getValue(callObject.value),
			type: 'ethTransfer'
		});
	}
	if(callObject.calls){
		for (const _callObject of callObject.calls) {
			await findInterestingCalls(txs, _callObject, web3);
		}
	}
}


function combineCallsWithLogs(txs, logs){
	let tempTxs = [...txs];

	let noMatch = [];
	let updatedLogs = [];
	for (let i = 0; i < logs.length; i++) {
		let log = logs[i];
		var type = log.name.toLowerCase();
		var logInfos = [];
		if(type === 'transfer'){
			var transferEvent = log.events;

			var logInfo = {
				tokenAddress: log.address.toLowerCase(),
				to: transferEvent[1].value.toLowerCase(),
				from: transferEvent[0].value.toLowerCase(),
				rawValue: transferEvent[2].value,
				type: 'transfer'
			}
			logInfos.push(logInfo);
		}

		if(type === 'deposit'){
			var depositEvent = log.events;
			var toDepositLog = {
				tokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
				to: log.address.toLowerCase(),
				from: depositEvent[0].value.toLowerCase(),
				rawValue: depositEvent[1].value,
				type: 'deposit'
			}
			var fromDepositLog = {
				tokenAddress: log.address.toLowerCase(),
				to: depositEvent[0].value.toLowerCase(),
				from: log.address.toLowerCase(),
				rawValue: depositEvent[1].value,
				type: 'deposit'
			}
			logInfos.push(toDepositLog);
			logInfos.push(fromDepositLog);
		}

		if(type === 'withdrawal'){
			var withdrawEvent = log.events;

			var logInfo = {
				tokenAddress: log.address.toLowerCase(),
				to: log.address.toLowerCase(),
				from: withdrawEvent[0].value.toLowerCase(),
				rawValue: withdrawEvent[1].value,
				type: 'withdraw'
			}
			logInfos.push(logInfo);
		}
		if(logInfos.length > 0) {
			for (let i = 0; i < logInfos.length; i++) {
				var logInfo = logInfos[i];
				var newObj = {
					token: logInfo.tokenAddress,
					to: logInfo.to,
					from: logInfo.from,
					rawValue: logInfo.rawValue,
					type: logInfo.type
				};
				updatedLogs.push(newObj);
				// findLogsWithoutMatch(logInfos[i], txs, noMatch, updatedLogs);
			}
		}
	}
	return combineTxsAndLogs2(updatedLogs, txs, tempTxs);
	console.log('sheeeesh ' + JSON.stringify(noMatch));
	return tempTxs;
}

function findLogsWithoutMatch(logInfo, txs, noMatch, updatedLogs){
	var result = tryFindMatch(txs, logInfo);
	var newObj = {
		token: logInfo.tokenAddress,
		to: logInfo.to,
		from: logInfo.from,
		rawValue: logInfo.rawValue,
		type: logInfo.type
	};
	if(!result.matchFound){
		noMatch.push(newObj);
		newObj.isNoMatch = true;
		updatedLogs.push(newObj);
	}else{
		newObj.isNoMatch = false;
		newObj.txMatchIndex = result.txMatchIndex;
		updatedLogs.push(newObj);
	}
}

function tryFindMatch(txs, logInfo){
	var txType = logInfo.type;
	var result = {
		matchFound: false,
		txMatchIndex: undefined
	};
	for (let i = 0; i < txs.length; i++) {
		let tx = txs[i];
		if(tx.alreadyMatched){
			continue;
		}
		if(tx.logCompareType === txType){
			if(logInfo.from === tx.from 
				&& logInfo.to === tx.to 
				&& logInfo.tokenAddress === tx.token
				&& logInfo.rawValue === tx.rawValue) 
			{
				result.txMatchIndex = i;
				result.matchFound = true;
				tx.alreadyMatched = true;
				break;
			}
		}
	}
	return result;
}
 
function combineTxsAndLogs(logs, txs, tmpTxs){
	var previousLogElement = undefined;
	var elementsInserted = 0;
	var logElement = undefined;
	for (let i = 0; i < logs.length; i++) {
		logElement = logs[i];
		if(logElement.isNoMatch){
			if(previousLogElement){
				var txIndex = getCorrectTxIndex(txs, previousLogElement.txMatchIndex);
				var correctedIndex = txIndex + elementsInserted;
				elementsInserted++;
				tmpTxs.splice(correctedIndex, 0, logElement);
				previousLogElement = undefined;
			}else{
				elementsInserted++;
				tmpTxs.splice(0, 0, logElement);
			}
		}else{
			previousLogElement = logElement;
			logElement = undefined;
		}
	}
	if(previousLogElement){
		var txIndex = getCorrectTxIndex(txs, previousLogElement.txMatchIndex);
		var correctedIndex = txIndex + elementsInserted;
		elementsInserted++;
		if(logElement){
			tmpTxs.splice(correctedIndex, 0, logElement);
			logElement = undefined;
		}
	}
}

function combineTxsAndLogs2(logs, txs){
	var tmpTxs = [];
	var txsUsed = 0;
	for (let i = 0; i < logs.length; i++) {
		var logElement = logs[i];
		if(txsUsed === txs.length){
			tmpTxs.push(logElement);
			continue;
		}
		var logMatchedAnyTx = false;
		for (let i = txsUsed; i < txs.length; i++) {
			var txElement = txs[i];
			if(txElement.isUsed){
				continue;
			}
			if(txElement.type === 'ethTransfer'){
				txElement.isUsed = true;
				tmpTxs.push(txElement);
				txsUsed++;
				continue;
			}
			if(doesLogEqualTx(txElement, logElement)){
				txElement.isUsed = true;
				tmpTxs.push(txElement);
				txsUsed++;
				logMatchedAnyTx = true;
				break;
			}
		}
		if(!logMatchedAnyTx){
			tmpTxs.push(logElement);
		}
	}
	return tmpTxs;
}

function doesLogEqualTx(tx, logInfo){
	if(tx.logCompareType === logInfo.type){
		if(logInfo.from === tx.from 
			&& logInfo.to === tx.to 
			&& logInfo.tokenAddress === tx.token
			&& logInfo.rawValue === tx.rawValue) 
		{
			return true;
		}
	}
	return false;
}

function getCorrectTxIndex(txs, matchIndex){
	if(matchIndex === txs.length){
		return txs.length;
	}
	for (let i = matchIndex+1; i < txs.length; i++) {
		if(txs[i].type !== 'ethTransfer'){
			return i;
		}
	}
	return txs.length;
}
