import {Log} from './logIndex.model';

export interface ProcessedCall {
    token: string;
    to: string;
    from: string;
    rawValue: string;
    type: string;
    logCompareType: string;
    logs?: Log[];
    error?: string;
}
