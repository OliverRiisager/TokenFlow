import { getValue }from './utility';
import { contractAddressToNames, tokenAddressToSymbolDecimals, SymbolDecimal } from './knownAddresses'
import { Transfer } from './model';
import Web3 from 'web3';
import { BatchRequest } from 'web3-core';

export async function translateCallsAndLogs(combinedLogsAndTxs : Transfer[], web3:Web3, senderAddress:string, erc20abi:any) : 
	Promise<{transfers:Transfer[], nodes:{address: string|null|undefined, name:string|null|undefined}[]}> 
{
    let nodes:string[] = [];
    let tokenAddresses:string[] = [];
	
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
    let mappedNodes:{address: string, name:string|null|undefined}[] = [];
    mappedNodes = nodes.map((node) => {
        return {
            address: node,
            name: node === senderAddress ? 'sender' : contractAddressToNames.HasContractAddress(node) ? contractAddressToNames.GetContractName(node) : node
        }
    });

    combinedLogsAndTxs.forEach(tx => {
		let tokenSymbolDecimal = tokenAddressToSymbolDecimals.GetTokenSymbolDecimal(tx.token);
		tx.tokenName = tokenSymbolDecimal !== undefined ? tokenSymbolDecimal?.symbol : tx.token;
		let decimal = tokenSymbolDecimal !== undefined ? tokenSymbolDecimal?.decimals : 18;
        tx.value = getValue(tx.rawValue, decimal !== undefined ? decimal : 18, true);
    });

    return 	{
        transfers: combinedLogsAndTxs,
        nodes: mappedNodes
    }
}

async function mapAddressesToNames(tokenAddresses : string[], contractAddresses : string[], web3 : Web3, erc20abi : any) : Promise<void> {
	let batch = new web3.BatchRequest();

	let tokenCallObjects : any[] = [];
	
	for (const tokenAddress of tokenAddresses) {
		if(!tokenAddressToSymbolDecimals.HasTokenAddress(tokenAddress)) {
			let erc20Contract = await new web3.eth.Contract(erc20abi, tokenAddress);
			let symbolCall = erc20Contract.methods.symbol().call;
			let decimalsCall = erc20Contract.methods.decimals().call;
			tokenCallObjects.push({address: tokenAddress, symbolCall: symbolCall, decimalCall: decimalsCall});
		}
	}

	let contractCallObjects : any[] = [];

	for (const contractAddress of contractAddresses) {
		if(contractAddressToNames.HasContractAddress(contractAddress)) {
			let erc20Contract = await new web3.eth.Contract(erc20abi, contractAddress);
			let nameCall = erc20Contract.methods.name().call;
			contractCallObjects.push({address: contractAddress, nameCall: nameCall});
		}
	}

	if (tokenCallObjects.length == 0 && contractCallObjects.length == 0) {
		return;
	}

	let tokenPromises : any[] = [];
	for (const tokenCallObject of tokenCallObjects) {
		pushPromise(tokenPromises, tokenCallObject.symbolCall, batch, tokenCallObject.address);
		pushPromise(tokenPromises, tokenCallObject.decimalCall, batch, 18);
	}
	let contractPromises : any[] = [];
	for (const contractCallObject of contractCallObjects) {
		pushPromise(contractPromises, contractCallObject.nameCall, batch, contractCallObject.address);
	}

	batch.execute();

	let tokenInformation = await resolvePromises(tokenPromises);
	let contractInformation = await resolvePromises(contractPromises);

	let tokenIndex = 0;
	for (let i = 0; i < tokenCallObjects.length; i++) {
		tokenAddressToSymbolDecimals.AddTokenAddressSymbolDecimal(tokenCallObjects[i].address, new SymbolDecimal(tokenInformation[tokenIndex], tokenInformation[tokenIndex+1]));
		tokenIndex = tokenIndex + 2;
	}
	for (let i = 0; i < contractCallObjects.length; i++) {
		contractAddressToNames.AddContractAddressToNamesMap(contractCallObjects[i].address, contractInformation[i]);
	}
}

function pushPromise(promises : any[], call : any, batch : BatchRequest, backup:any = undefined) : void {
	promises.push(new Promise((res, rej) => {
		let req = call.request({}, "latest", (err:string, data:any) => {
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

async function resolvePromises(promises:any[]) : Promise<any[]>{
	return Promise.all(
		promises.map((p) => {
			return p.catch((e:any) => {
				return e.backup ? e.backup : 'unknown';
			});
		})
	);
}