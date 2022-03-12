import {Transfer} from './model';
import Web3 from 'web3';
export declare function translateCallsAndLogs(
    combinedLogsAndTxs: Transfer[],
    web3: Web3,
    senderAddress: string,
    erc20abi: any
): Promise<{
    transfers: Transfer[];
    nodes: {
        address: string | null | undefined;
        name: string | null | undefined;
    }[];
}>;
//# sourceMappingURL=callLogTranslator.d.ts.map
