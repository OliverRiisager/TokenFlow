import {Transfer} from '.';

export interface TransfersNodes {
    transfers: Transfer[];
    nodes: AddressNameObject[];
}

export interface AddressNameObject {
    address: string;
    name: string | undefined;
}
