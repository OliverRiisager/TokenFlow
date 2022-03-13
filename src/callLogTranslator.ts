import {getValue} from './utility';
import {
    contractAddressToNames,
    tokenAddressToSymbolDecimals,
    SymbolDecimal,
} from './knownAddresses';
import {Transfer, TransfersNodes} from './model';
import Web3 from 'web3';
import {BatchRequest} from 'web3-core';
import {AbiService} from './services';

/* eslint-disable @typescript-eslint/no-explicit-any*/
const contractCallObjects: {address: string; nameCall: any}[] = [];
const tokenCallObjects: {address: string; symbolCall: any; decimalCall: any}[] =
    [];

const tokenPromises: any[] = [];
const contractPromises: any[] = [];
/* eslint-enable @typescript-eslint/no-explicit-any*/

export async function translateCallsAndLogs(
    combinedLogsAndTxs: Transfer[],
    web3: Web3,
    senderAddress: string
): Promise<TransfersNodes> {
    const tokenAddressesAndNodes =
        getNodesAndTokenAddresses(combinedLogsAndTxs);
    try {
        await mapAddressesToNames(tokenAddressesAndNodes, web3);
    } catch (e) {
        console.log('Error encountered when mapping adresses to names ' + e);
    }
    const mappedNodes = createMappedNodes(
        tokenAddressesAndNodes.nodes,
        senderAddress
    );
    fixCombinedLogsAndTxs(combinedLogsAndTxs);
    return {
        transfers: combinedLogsAndTxs,
        nodes: mappedNodes,
    };
}

function getNodesAndTokenAddresses(combinedLogsAndTxs: Transfer[]): {
    nodes: string[];
    tokenAddresses: string[];
} {
    const nodes: string[] = [];
    const tokenAddresses: string[] = [];

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
    return {nodes: nodes, tokenAddresses: tokenAddresses};
}

async function mapAddressesToNames(
    tokenAddressesAndNodes: {tokenAddresses: string[]; nodes: string[]},
    web3: Web3
): Promise<void> {
    createContractAndTokenCallObjects(
        tokenAddressesAndNodes.tokenAddresses,
        tokenAddressesAndNodes.nodes,
        web3
    );

    if (tokenCallObjects.length == 0 && contractCallObjects.length == 0) {
        return;
    }
    return createAndResolvePromises(web3);
}

function createContractAndTokenCallObjects(
    tokenAddresses: string[],
    contractAddresses: string[],
    web3: Web3
): void {
    initializeTokenSymbolCallObjects(tokenAddresses, web3);
    initializeContractCallObjects(contractAddresses, web3);
}

function initializeTokenSymbolCallObjects(
    tokenAddresses: string[],
    web3: Web3
): void {
    for (const tokenAddress of tokenAddresses) {
        if (!tokenAddressToSymbolDecimals.hasTokenAddress(tokenAddress)) {
            const erc20Contract = new web3.eth.Contract(
                AbiService.getInstance().getErc20Abi(),
                tokenAddress
            );
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

function initializeContractCallObjects(
    contractAddresses: string[],
    web3: Web3
): void {
    for (const contractAddress of contractAddresses) {
        if (contractAddressToNames.hasContractAddress(contractAddress)) {
            const erc20Contract = new web3.eth.Contract(
                AbiService.getInstance().getErc20Abi(),
                contractAddress
            );
            const nameCall = erc20Contract.methods.name().call;
            contractCallObjects.push({
                address: contractAddress,
                nameCall: nameCall,
            });
        }
    }
}

function createAndPushTokenPromises(batch: BatchRequest): void {
    for (const tokenCallObject of tokenCallObjects) {
        pushPromise(
            tokenPromises,
            tokenCallObject.symbolCall,
            batch,
            tokenCallObject.address
        );
        pushPromise(tokenPromises, tokenCallObject.decimalCall, batch, 18);
    }
}

function createAndPushContractPromises(batch: BatchRequest): void {
    for (const contractCallObject of contractCallObjects) {
        pushPromise(
            contractPromises,
            contractCallObject.nameCall,
            batch,
            contractCallObject.address
        );
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any*/
function pushPromise(
    promises: any[],
    functionCall: any,
    batch: BatchRequest,
    backup: any = undefined
): void {
    promises.push(
        new Promise((res, rej) => {
            const req = functionCall.request(
                {},
                'latest',
                (err: string, data: any) => {
                    if (err) {
                        rej({err, backup});
                    } else {
                        res(data);
                    }
                }
            );
            batch.add(req);
        })
    );
}
/* eslint-enable @typescript-eslint/no-explicit-any*/

async function createAndResolvePromises(web3: Web3): Promise<void> {
    const batch = new web3.BatchRequest();
    createAndPushTokenPromises(batch);
    createAndPushContractPromises(batch);

    return await resolvePromisesAndAddNames(batch);
}

async function resolvePromisesAndAddNames(batch: BatchRequest): Promise<void> {
    batch.execute();
    const tokenInformation = await resolvePromises(tokenPromises);
    const contractInformation = await resolvePromises(contractPromises);

    addTokenAddressSymbolDecimals(tokenInformation);
    addContractAddressToNames(contractInformation);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function addTokenAddressSymbolDecimals(tokenInformation: any[]) {
    let tokenIndex = 0;
    for (let i = 0; i < tokenCallObjects.length; i++) {
        tokenAddressToSymbolDecimals.addTokenAddressSymbolDecimal(
            tokenCallObjects[i].address,
            new SymbolDecimal(
                tokenInformation[tokenIndex],
                tokenInformation[tokenIndex + 1]
            )
        );
        tokenIndex = tokenIndex + 2;
    }
}

function addContractAddressToNames(contractInformation: any[]) {
    for (let i = 0; i < contractCallObjects.length; i++) {
        contractAddressToNames.addContractAddressToNamesMap(
            contractCallObjects[i].address,
            contractInformation[i]
        );
    }
}

async function resolvePromises(promises: any[]): Promise<any[]> {
    return Promise.all(
        promises.map((p) => {
            return p.catch((e: any) => {
                return e.backup ? e.backup : 'unknown';
            });
        })
    );
}

function createMappedNodes(
    nodes: string[],
    senderAddress: string
): {address: string; name: string | undefined}[] {
    let mappedNodes: {address: string; name: string | undefined}[] = [];
    mappedNodes = nodes.map((node) => {
        return {
            address: node,
            name:
                node === senderAddress
                    ? 'sender'
                    : contractAddressToNames.hasContractAddress(node)
                    ? contractAddressToNames.getContractName(node)
                    : node,
        };
    });
    return mappedNodes;
}
/* eslint-enable @typescript-eslint/no-explicit-any*/

function fixCombinedLogsAndTxs(combinedLogsAndTxs: Transfer[]) {
    combinedLogsAndTxs.forEach((tx) => {
        const tokenSymbolDecimal =
            tokenAddressToSymbolDecimals.getTokenSymbolDecimal(tx.token);
        tx.tokenName =
            tokenSymbolDecimal !== undefined
                ? tokenSymbolDecimal?.symbol
                : tx.token;
        const decimal =
            tokenSymbolDecimal !== undefined
                ? tokenSymbolDecimal?.decimals
                : 18;
        tx.value = getValue(
            tx.rawValue,
            decimal !== undefined ? decimal : 18,
            true
        );
    });
}
