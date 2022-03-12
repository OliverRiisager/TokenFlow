import { Log } from './logIndex.model';
export interface CallObject {
    type: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasUsed: string;
    input: string;
    output: string;
    logs?: Log[];
    time: string;
    calls?: Call[];
    error?: string;
}
export interface Call {
    type: string;
    from: string;
    to: string;
    value: string;
    gas?: string;
    gasUsed?: string;
    input: string;
    output: string;
    logs?: Log[];
    calls?: Call[];
    error?: string;
}
