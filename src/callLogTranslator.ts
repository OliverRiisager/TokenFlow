import {getValue} from './utility';
import {
    contractAddressToNames,
    tokenAddressToSymbolDecimals,
    SymbolDecimal,
} from './knownAddresses';
import {Transfer, TransfersNodes, AddressNameObject} from './model';
import {AbiService} from './services';
import { ProviderConnector } from './connector/provider.connector';

/* eslint-disable @typescript-eslint/no-explicit-any*/
const contractCallObjects: {address: string; nameCall: any}[] = [];
const tokenCallObjects: {address: string; symbolCall: any; decimalCall: any}[] =
    [];

const tokenPromises: any[] = [];
const contractPromises: any[] = [];
/* eslint-enable @typescript-eslint/no-explicit-any*/

export async function translateCallsAndLogs(
    combinedLogsAndTxs: Transfer[],
    providerConnector: ProviderConnector,
    senderAddress: string
): Promise<TransfersNodes> {
    const tokenAddressesAndNodes =
        getNodesAndTokenAddresses(combinedLogsAndTxs);
    try {
        await mapAddressesToNames(tokenAddressesAndNodes, providerConnector);
    } catch (e) {
        console.log('Error encountered when mapping adresses to names ' + e);
    }
    const mappedNodes = createMappedNodes(
        tokenAddressesAndNodes.nodes,
        senderAddress
    );
    setTokenNameAndValues(combinedLogsAndTxs);
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
    providerConnector: ProviderConnector
): Promise<void> {
    createContractAndTokenCallObjects(
        tokenAddressesAndNodes.tokenAddresses,
        tokenAddressesAndNodes.nodes,
        providerConnector
    );

    if (tokenCallObjects.length == 0 && contractCallObjects.length == 0) {
        return;
    }
    return createAndResolvePromises(providerConnector);
}

function createContractAndTokenCallObjects(
    tokenAddresses: string[],
    contractAddresses: string[],
    providerConnector: ProviderConnector
): void {
    initializeTokenSymbolCallObjects(tokenAddresses, providerConnector);
    initializeContractCallObjects(contractAddresses, providerConnector);
}

function initializeTokenSymbolCallObjects(
    tokenAddresses: string[],
    providerConnector: ProviderConnector
): void {
    for (const tokenAddress of tokenAddresses) {
        if (!tokenAddressToSymbolDecimals.hasTokenAddress(tokenAddress)) {
            const erc20Contract = providerConnector.getContract(
                AbiService.getInstance().getErc20Abi(),
                tokenAddress);
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
    providerConnector: ProviderConnector
): void {
    for (const contractAddress of contractAddresses) {
        if (contractAddressToNames.hasContractAddress(contractAddress)) {
            const erc20Contract = providerConnector.getContract(
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

function createAndPushTokenPromises(provider: ProviderConnector): void {
    for (const tokenCallObject of tokenCallObjects) {
        pushPromise(
            tokenPromises,
            tokenCallObject.symbolCall,
            provider,
            tokenCallObject.address
        );
        pushPromise(tokenPromises, tokenCallObject.decimalCall, provider, 18);
    }
}

function createAndPushContractPromises(provider: ProviderConnector): void {
    for (const contractCallObject of contractCallObjects) {
        pushPromise(
            contractPromises,
            contractCallObject.nameCall,
            provider,
            contractCallObject.address
        );
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any*/
function pushPromise(
    promises: any[],
    functionCall: any,
    provider: ProviderConnector,
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
            provider.addRequestToBatch(req);
        })
    );
}
/* eslint-enable @typescript-eslint/no-explicit-any*/

async function createAndResolvePromises(provider: ProviderConnector): Promise<void> {
    createAndPushTokenPromises(provider);
    createAndPushContractPromises(provider);

    return await resolvePromisesAndAddNames(provider);
}

async function resolvePromisesAndAddNames(provider: ProviderConnector): Promise<void> {
    provider.executeBatch();
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
): AddressNameObject[] {
    let mappedNodes: AddressNameObject[] = [];
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

function setTokenNameAndValues(combinedLogsAndTxs: Transfer[]) {
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
