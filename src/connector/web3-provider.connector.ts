import Web3 from 'web3';
import {BatchRequest} from 'web3-core';
import {ProviderConnector} from './provider.connector';
import {CallObject, Receipt} from '../model';
import {ConvertReceipt, ConvertCallObject} from '../jsonConverters';
import {SymbolDecimal} from '../knownAddresses';
import {Contract} from 'web3-eth-contract';
import erc20Abi from '../../public/abis/erc20.json';

export class Web3Provider implements ProviderConnector {
    protected readonly web3: Web3;

    protected batch: BatchRequest;

    protected addressToTokens: Map<string, Contract> = new Map<
        string,
        Contract
    >();

    protected addressToContractMap: Map<string, Contract> = new Map<
        string,
        Contract
    >();

    constructor(web3: Web3) {
        this.web3 = this.extendWeb3(web3);
        this.batch = new web3.BatchRequest();
    }

    async traceTransaction(
        txHash: string,
        customTracer: string
    ): Promise<CallObject> {
        try {
            /* eslint-disable max-len*/
            /* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any*/
            //@ts-ignore
            const callObjectData = await (
                this.web3 as any
            ).debug.traceTransaction(txHash, {
                reexec: 5000,
                tracer: customTracer,
            });
            /* eslint-enable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
            /* eslint-enable max-len*/
            return ConvertCallObject.toCallObject(
                JSON.stringify(callObjectData)
            );
        } catch (e) {
            console.log('ERR: ' + e);
            throw e;
        }
    }

    async getTransactionReceipt(txHash: string): Promise<Receipt> {
        try {
            const receiptData = await this.web3.eth.getTransactionReceipt(
                txHash
            );
            return ConvertReceipt.toReceipt(JSON.stringify(receiptData));
        } catch (e) {
            console.log('ERR: ' + e);
            throw e;
        }
    }

    resolveContractNamesAndTokenSymbolDecimals(): boolean {
        return true;
    }

    /* eslint-disable max-lines-per-function*/
    async resolveContractNamesSymbolsAndDecimals(
        contractAddresses: string[],
        tokenAddresses: string[]
    ): Promise<{
        contractNames: {address: string; name: string}[];
        tokenSymbolsAndDecimals: {
            address: string;
            symbolDecimal: SymbolDecimal;
        }[];
    }> {
        const contractNamePromises =
            this.handleContractNameCalls(contractAddresses);
        const tokenSymbolsAndDecimalPromises =
            this.handleTokenAddressSymbolsAndDecimals(tokenAddresses);
        const result = await Promise.all([
            Promise.all(contractNamePromises),
            Promise.all(tokenSymbolsAndDecimalPromises),
        ]);

        const resolvedContractNames: {address: string; name: string}[] = [];
        const resolvedTokenSymbolsAndDecimals: {
            address: string;
            symbolDecimal: SymbolDecimal;
        }[] = [];

        result[0].forEach((addressNameResult) => {
            resolvedContractNames.push({
                address: addressNameResult.address,
                name: addressNameResult.name,
            });
        });
        result[1].forEach((tokenSymbolDecimalsResult) => {
            const tokenAddress = tokenSymbolDecimalsResult[0];
            const tokenSymbol = tokenSymbolDecimalsResult[1];
            const tokenDecimals = tokenSymbolDecimalsResult[2];
            resolvedTokenSymbolsAndDecimals.push({
                address: tokenAddress,
                symbolDecimal: new SymbolDecimal(tokenSymbol, tokenDecimals),
            });
        });
        return {
            contractNames: resolvedContractNames,
            tokenSymbolsAndDecimals: resolvedTokenSymbolsAndDecimals,
        };
    }
    /* eslint-enable max-lines-per-function*/

    private handleContractNameCalls(
        contractAddresses: string[]
    ): Promise<{address: string; name: string}>[] {
        const promises: Promise<{address: string; name: string}>[] = [];
        contractAddresses.forEach((element) => {
            this.addContractIfNotPresent(element);
            const contract = this.addressToContractMap.get(element);
            if (contract !== undefined) {
                const promise = contract.methods
                    .name()
                    .call()
                    .then((res: string) => {
                        return {address: element, name: res};
                    })
                    .catch(() => {
                        return {address: element, name: element};
                    });
                promises.push(promise);
            }
        });
        return promises;
    }

    private handleTokenAddressSymbolsAndDecimals(
        tokenAddresses: string[]
    ): Promise<[string, string, number]>[] {
        const promises: Promise<[string, string, number]>[] = [];
        tokenAddresses.forEach((element) => {
            this.addContractIfNotPresent(element);
            const contract = this.addressToContractMap.get(element);
            if (contract !== undefined) {
                promises.push(
                    this.createTokenSymbolDecimalsPromise(element, contract)
                );
            }
        });
        return promises;
    }

    /* eslint-disable max-lines-per-function*/
    private createTokenSymbolDecimalsPromise(
        address: string,
        contract: Contract
    ): Promise<[string, string, number]> {
        const promise = Promise.all([
            address,
            contract.methods
                .symbol()
                .call()
                .then((res: string) => {
                    return res;
                })
                .catch(() => {
                    return address;
                }) as string,
            contract.methods
                .decimals()
                .call()
                .then((res: number) => {
                    return res;
                })
                .catch(() => {
                    return 18;
                }) as number,
        ])
            .then((result: [string, string, number]) => {
                return result;
            })
            .catch(() => {
                const errResult: [string, string, number] = [
                    address,
                    address,
                    18,
                ];
                return errResult;
            });
        return promise;
    }
    /* eslint-enable max-lines-per-function*/

    private addContractIfNotPresent(address: string) {
        if (!this.addressToContractMap.has(address)) {
            this.addressToContractMap.set(
                address,
                /* eslint-disable max-len*/
                /* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any*/
                //@ts-ignore
                new this.web3.eth.Contract(erc20Abi as any, address)
                /* eslint-enable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any*/
                /* eslint-enable max-len*/
            );
        }
    }

    private extendWeb3(_web3Instance: Web3): Web3 {
        _web3Instance.extend({
            property: 'debug',
            methods: [
                {
                    name: 'traceTransaction',
                    call: 'debug_traceTransaction',
                    params: 2,
                },
            ],
        });
        return _web3Instance;
    }
}
