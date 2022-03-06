import { Log } from './logIndex.model';

export interface Transfer {
    token:           string;
    to:              string;
    from:            string;
    rawValue:        string;
    type:            string;
    logCompareType?: string;
    value?:          number;
    logs?:           Log[];
    tokenName?:      string;
    isLog?:          boolean;
    logIndex?:       number;
}
