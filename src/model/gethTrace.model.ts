import { CallObject, Receipt } from ".";

export interface GethTrace {
    receipt: Receipt | null;
    callObject: CallObject | null;
    error?: string;
}
