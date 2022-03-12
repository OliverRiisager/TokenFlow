"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateCallsAndLogs = void 0;
const tslib_1 = require("tslib");
const utility_1 = require("./utility");
const knownAddresses_1 = require("./knownAddresses");
const services_1 = require("./services");
/* eslint-disable @typescript-eslint/no-explicit-any*/
const contractCallObjects = [];
const tokenCallObjects = [];
const tokenPromises = [];
const contractPromises = [];
/* eslint-enable @typescript-eslint/no-explicit-any*/
function translateCallsAndLogs(combinedLogsAndTxs, web3, senderAddress) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const tokenAddressesAndNodes = getNodesAndTokenAddresses(combinedLogsAndTxs);
        try {
            yield mapAddressesToNames(tokenAddressesAndNodes, web3);
        }
        catch (e) {
            console.log('Error encountered when mapping adresses to names ' + e);
        }
        const mappedNodes = createMappedNodes(tokenAddressesAndNodes.nodes, senderAddress);
        fixCombinedLogsAndTxs(combinedLogsAndTxs);
        return {
            transfers: combinedLogsAndTxs,
            nodes: mappedNodes,
        };
    });
}
exports.translateCallsAndLogs = translateCallsAndLogs;
function getNodesAndTokenAddresses(combinedLogsAndTxs) {
    const nodes = [];
    const tokenAddresses = [];
    combinedLogsAndTxs.forEach((element) => {
        if (nodes.indexOf(element.from) === -1) {
            nodes.push(element.from);
        }
        if (nodes.indexOf(element.to) === -1) {
            nodes.push(element.to);
        }
        if (tokenAddresses.indexOf(element.token) === -1) {
            tokenAddresses.push(element.token);
        }
    });
    return { nodes: nodes, tokenAddresses: tokenAddresses };
}
function mapAddressesToNames(tokenAddressesAndNodes, web3) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        createContractAndTokenCallObjects(tokenAddressesAndNodes.tokenAddresses, tokenAddressesAndNodes.nodes, web3);
        if (tokenCallObjects.length == 0 && contractCallObjects.length == 0) {
            return;
        }
        return createAndResolvePromises(web3);
    });
}
function createContractAndTokenCallObjects(tokenAddresses, contractAddresses, web3) {
    initializeTokenSymbolCallObjects(tokenAddresses, web3);
    initializeContractCallObjects(contractAddresses, web3);
}
function initializeTokenSymbolCallObjects(tokenAddresses, web3) {
    for (const tokenAddress of tokenAddresses) {
        if (!knownAddresses_1.tokenAddressToSymbolDecimals.hasTokenAddress(tokenAddress)) {
            const erc20Contract = new web3.eth.Contract(services_1.AbiService.getInstance().erc20abi, tokenAddress);
            const symbolCall = erc20Contract.methods.symbol().call;
            const decimalsCall = erc20Contract.methods.decimals().call;
            tokenCallObjects.push({
                address: tokenAddress,
                symbolCall: symbolCall,
                decimalCall: decimalsCall,
            });
        }
    }
}
function initializeContractCallObjects(contractAddresses, web3) {
    for (const contractAddress of contractAddresses) {
        if (knownAddresses_1.contractAddressToNames.hasContractAddress(contractAddress)) {
            const erc20Contract = new web3.eth.Contract(services_1.AbiService.getInstance().erc20abi, contractAddress);
            const nameCall = erc20Contract.methods.name().call;
            contractCallObjects.push({
                address: contractAddress,
                nameCall: nameCall,
            });
        }
    }
}
function createAndPushTokenPromises(batch) {
    for (const tokenCallObject of tokenCallObjects) {
        pushPromise(tokenPromises, tokenCallObject.symbolCall, batch, tokenCallObject.address);
        pushPromise(tokenPromises, tokenCallObject.decimalCall, batch, 18);
    }
}
function createAndPushContractPromises(batch) {
    for (const contractCallObject of contractCallObjects) {
        pushPromise(contractPromises, contractCallObject.nameCall, batch, contractCallObject.address);
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any*/
function pushPromise(promises, functionCall, batch, backup = undefined) {
    promises.push(new Promise((res, rej) => {
        const req = functionCall.request({}, 'latest', (err, data) => {
            if (err) {
                rej({ err, backup });
            }
            else {
                res(data);
            }
        });
        batch.add(req);
    }));
}
/* eslint-enable @typescript-eslint/no-explicit-any*/
function createAndResolvePromises(web3) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const batch = new web3.BatchRequest();
        createAndPushTokenPromises(batch);
        createAndPushContractPromises(batch);
        return yield resolvePromisesAndAddNames(batch);
    });
}
function resolvePromisesAndAddNames(batch) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        batch.execute();
        const tokenInformation = yield resolvePromises(tokenPromises);
        const contractInformation = yield resolvePromises(contractPromises);
        addTokenAddressSymbolDecimals(tokenInformation);
        addContractAddressToNames(contractInformation);
    });
}
/* eslint-disable @typescript-eslint/no-explicit-any */
function addTokenAddressSymbolDecimals(tokenInformation) {
    let tokenIndex = 0;
    for (let i = 0; i < tokenCallObjects.length; i++) {
        knownAddresses_1.tokenAddressToSymbolDecimals.addTokenAddressSymbolDecimal(tokenCallObjects[i].address, new knownAddresses_1.SymbolDecimal(tokenInformation[tokenIndex], tokenInformation[tokenIndex + 1]));
        tokenIndex = tokenIndex + 2;
    }
}
function addContractAddressToNames(contractInformation) {
    for (let i = 0; i < contractCallObjects.length; i++) {
        knownAddresses_1.contractAddressToNames.addContractAddressToNamesMap(contractCallObjects[i].address, contractInformation[i]);
    }
}
function resolvePromises(promises) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return Promise.all(promises.map((p) => {
            return p.catch((e) => {
                return e.backup ? e.backup : 'unknown';
            });
        }));
    });
}
function createMappedNodes(nodes, senderAddress) {
    let mappedNodes = [];
    mappedNodes = nodes.map((node) => {
        return {
            address: node,
            name: node === senderAddress
                ? 'sender'
                : knownAddresses_1.contractAddressToNames.hasContractAddress(node)
                    ? knownAddresses_1.contractAddressToNames.getContractName(node)
                    : node,
        };
    });
    return mappedNodes;
}
/* eslint-enable @typescript-eslint/no-explicit-any*/
function fixCombinedLogsAndTxs(combinedLogsAndTxs) {
    combinedLogsAndTxs.forEach((tx) => {
        const tokenSymbolDecimal = knownAddresses_1.tokenAddressToSymbolDecimals.getTokenSymbolDecimal(tx.token);
        tx.tokenName =
            tokenSymbolDecimal !== undefined
                ? tokenSymbolDecimal === null || tokenSymbolDecimal === void 0 ? void 0 : tokenSymbolDecimal.symbol
                : tx.token;
        const decimal = tokenSymbolDecimal !== undefined
            ? tokenSymbolDecimal === null || tokenSymbolDecimal === void 0 ? void 0 : tokenSymbolDecimal.decimals
            : 18;
        tx.value = (0, utility_1.getValue)(tx.rawValue, decimal !== undefined ? decimal : 18, true);
    });
}
//# sourceMappingURL=callLogTranslator.js.map