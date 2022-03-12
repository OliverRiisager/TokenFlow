import { Transfer } from '../model/transferObject.model';
export declare class ConvertToTransfer {
    static toTransfer(json: string): Transfer[];
    static transferToJson(value: Transfer[]): string;
}
