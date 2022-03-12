export interface DecodedLog {
    name: string;
    events: Event[];
    address: string;
}

export interface Event {
    name: string;
    type: string;
    value: string;
}
