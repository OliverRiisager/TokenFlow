import { Transfer } from '.';
export interface TransfersNodes {
    transfers: Transfer[];
    nodes: Nodes[];
}
export interface Nodes {
    address: string;
    name: string | undefined;
}
