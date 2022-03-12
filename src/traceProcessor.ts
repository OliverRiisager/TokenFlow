import {GethTrace, getTrace} from './traceGetter';
import {processCalls} from './callProcessor';
import {processLogs} from './logProcessor';
import {insertLogs} from './callLogCombiner';
import {translateCallsAndLogs} from './callLogTranslator';
// @ts-ignore
import abiDecoder from 'abi-decoder';
import Web3 from 'web3';
import {ConfigService} from './configService';

import erc20abi from '../public/abis/erc20.json';
import wethAbi from '../public/abis/wrappedEther.json';
import {CallObject, Transfer, DecodedLog} from './model';
import {DecodedLogConvert} from './decodedLog';

export class traceProcessor {
    web3: Web3;

    constructor() {
        abiDecoder.addABI(erc20abi);
        abiDecoder.addABI(wethAbi);

        let config = ConfigService.getInstance().config;

        if (config === undefined) {
            throw 'config not defined - please create config through configservice.';
        }

        let web3Instance = new Web3(
            new Web3.providers.HttpProvider(config.httpGethProvider)
        );
        this.web3 = this.extendWeb3(web3Instance);
    }

    extendWeb3(_web3Instance: Web3): Web3 {
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

    getTransfers(txHash: string) {
        return this.doGetTransfers(txHash);
    }

    async doGetTransfers(
        txHash: string
    ): Promise<{
        transfers: Transfer[];
        nodes: {
            address: string | null | undefined;
            name: string | null | undefined;
        }[];
    }> {
        let rawTransferData: GethTrace = await getTrace(txHash, this.web3);
        if (rawTransferData.error !== undefined) {
            throw rawTransferData.error;
        }
        let callObject: CallObject | null = rawTransferData.callObject;
        if (callObject === null) {
            throw 'Callobject is null - please double check your config';
        }
        let processedCalls = processCalls(callObject, abiDecoder);

        let receipt = rawTransferData.receipt;
        if (receipt === null) {
            throw 'Receipt is null - please double check your config';
        }

        abiDecoder.keepNonDecodedLogs();
        var decodedLogJsonString = JSON.stringify(
            abiDecoder.decodeLogs(receipt.logs)
        );
        let decodedLogs: (DecodedLog | null)[] =
            DecodedLogConvert.toDecodedLog(decodedLogJsonString);
        if (decodedLogs === null) {
            throw 'JSON converting logs failed';
        }
        let processedLogs = processLogs(decodedLogs);
        var combinedTxsAndLogs = insertLogs(processedLogs, processedCalls);

        let nodesAndTxs = await translateCallsAndLogs(
            combinedTxsAndLogs,
            this.web3,
            receipt.from,
            erc20abi
        );
        return nodesAndTxs;
    }
}
