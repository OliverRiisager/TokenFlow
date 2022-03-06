import { CallObject, Receipt } from './model';
import Web3 from 'web3';
export interface GethTrace {
    receipt: Receipt | null;
    callObject: CallObject | null;
    error?: string;
}
export declare function getTrace(txhash: string, web3: Web3): Promise<GethTrace>;
//# sourceMappingURL=traceGetter.d.ts.map