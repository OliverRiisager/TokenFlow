import { ProcessedLog } from './model/processedLog.model';
import { DecodedLog } from './model';
export declare function processLogs(logs: (DecodedLog | null)[]): ProcessedLog[];
