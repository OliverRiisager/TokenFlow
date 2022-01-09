const utility = require('./utility');
const knownAddresses = require('./knownAddresses');

let contractAddressToName = knownAddresses.contractAddressToName;
let tokenAddressToName = knownAddresses.tokenAddressToName;

async function translateCallsAndLogs(combinedLogsAndTxs, web3, senderAddress, erc20abi){
    let nodes = [];
    let tokenAddresses = [];

    combinedLogsAndTxs.forEach(element => {
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
        await mapAddressesToNames(tokenAddresses, nodes, web3, erc20abi);
    } catch(e) {
        console.log('Error encountered when mapping adresses to names ' + e);
    }

    nodes = nodes.map((node) => {
        return {
            address: node,
            name: node === senderAddress ? 'sender' : contractAddressToName[node]
        }
    });

    combinedLogsAndTxs.forEach(tx => {
        tx.tokenName = tokenAddressToName[tx.token].symbol;
        tx.value = utility.getValue(tx.rawValue, tokenAddressToName[tx.token].decimals, true);
    });

    return 	{
        transfers: combinedLogsAndTxs,
        nodes: nodes
    }
}

async function mapAddressesToNames(tokenAddresses, contractAddresses, web3, erc20abi) {
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

module.exports = translateCallsAndLogs;