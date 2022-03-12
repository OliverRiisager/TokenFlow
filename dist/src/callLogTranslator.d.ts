import { Transfer, TransfersNodes } from './model';
import Web3 from 'web3';
export declare function translateCallsAndLogs(combinedLogsAndTxs: Transfer[], web3: Web3, senderAddress: string): Promise<TransfersNodes>;
