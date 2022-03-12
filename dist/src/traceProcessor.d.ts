import Web3 from 'web3';
import {Transfer} from './model';
export declare class traceProcessor {
    web3: Web3;
    constructor();
    extendWeb3(_web3Instance: Web3): Web3;
    getTransfers(txHash: string): Promise<{
        transfers: Transfer[];
        nodes: {
            address: string;
            name: string;
        }[];
    }>;
    doGetTransfers(txHash: string): Promise<{
        transfers: Transfer[];
        nodes: {
            address: string | null | undefined;
            name: string | null | undefined;
        }[];
    }>;
}
//# sourceMappingURL=traceProcessor.d.ts.map
