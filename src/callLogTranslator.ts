import BigNumber from 'bignumber.js';
import {
    contractAddressToNames,
    tokenAddressToSymbolDecimals,
    SymbolDecimal,
} from './knownAddresses';
import {Transfer, TransfersNodes, AddressNameObject} from './model';
import {ProviderConnector} from './connector/provider.connector';

/* eslint-disable max-lines-per-function */
export async function translateCallsAndLogs(
    combinedLogsAndTxs: Transfer[],
    providerConnector: ProviderConnector,
    senderAddress: string
): Promise<TransfersNodes> {
    const tokenAddressesAndNodes =
        getNodesAndTokenAddresses(combinedLogsAndTxs);
    if (providerConnector.resolveContractNamesAndTokenSymbolDecimals()) {
        try {
            await mapAddressesToNames(
                tokenAddressesAndNodes,
                providerConnector
            );
        } catch (e) {
            console.log(
                'Error encountered when mapping adresses to names ' + e
            );
            throw e;
        }
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
/* eslint-enable max-lines-per-function */

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

/* eslint-disable max-lines-per-function */
async function mapAddressesToNames(
    tokenAddressesAndNodes: {tokenAddresses: string[]; nodes: string[]},
    providerConnector: ProviderConnector
): Promise<void> {
    if (
        providerConnector.resolveContractNamesSymbolsAndDecimals === undefined
    ) {
        throw new Error('Method not implemented.');
    }
    const unknownContractAddresses = getUnknownTokenAndContractAddresses(
        tokenAddressesAndNodes.nodes
    );
    const unknownTokenAddresses = getUnknownTokenAndContractAddresses(
        tokenAddressesAndNodes.tokenAddresses
    );

    if (
        unknownTokenAddresses.length == 0 &&
        unknownContractAddresses.length == 0
    ) {
        return;
    }

    const contractNamesAndTokenSymbolDecimals =
        await providerConnector.resolveContractNamesSymbolsAndDecimals(
            unknownContractAddresses,
            unknownTokenAddresses
        );

    addTokenAddressSymbolDecimals(
        contractNamesAndTokenSymbolDecimals.tokenSymbolsAndDecimals
    );
    addContractAddressToNames(
        contractNamesAndTokenSymbolDecimals.contractNames
    );
    return;
}
/* eslint-enable max-lines-per-function */

function getUnknownTokenAndContractAddresses(
    addressesToCheck: string[]
): string[] {
    const unknownAddresses: string[] = [];
    for (const contractAddress of addressesToCheck) {
        if (!contractAddressToNames.hasContractAddress(contractAddress)) {
            unknownAddresses.push(contractAddress);
        }
    }
    return unknownAddresses;
}

function addTokenAddressSymbolDecimals(
    tokenInformation: {address: string; symbolDecimal: SymbolDecimal}[]
) {
    for (let i = 0; i < tokenInformation.length; i++) {
        const tokenInfo = tokenInformation[i];
        tokenAddressToSymbolDecimals.addTokenAddressSymbolDecimal(
            tokenInfo.address,
            tokenInfo.symbolDecimal
        );
    }
}

function addContractAddressToNames(
    contractInformation: {address: string; name: string}[]
) {
    for (let i = 0; i < contractInformation.length; i++) {
        contractAddressToNames.addContractAddressToNamesMap(
            contractInformation[i].address,
            contractInformation[i].name
        );
    }
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

function getValue(
    value: BigNumber.Value,
    decimals: number,
    cutOff = false
): number {
    if (!decimals) {
        return new BigNumber(value).toNumber();
    }
    const s = '1e' + decimals;
    const x = new BigNumber(value);
    let temp = new BigNumber(x.div(s));
    if (cutOff) {
        temp = new BigNumber(temp.toFixed(3));
    }
    return temp.toNumber();
}
