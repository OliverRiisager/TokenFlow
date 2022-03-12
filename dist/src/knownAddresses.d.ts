export declare class SymbolDecimal {
    symbol: string;
    decimals: number;
    constructor(symbol: string, decimals: number);
}
export declare class TokenAddressToSymbolDecimal {
    tokenAddressToSymbolDecimal: Map<string, SymbolDecimal>;
    constructor();
    addTokenAddressSymbolDecimal(address: string, symbolDecimal: SymbolDecimal): boolean;
    getTokenSymbolDecimal(address: string): SymbolDecimal | undefined;
    hasTokenAddress(address: string): boolean;
}
export declare class ContractAddressToNames {
    contractAddressToNamesMap: Map<string, string>;
    constructor();
    addContractAddressToNamesMap(address: string, name: string): boolean;
    getContractName(address: string): string | undefined;
    hasContractAddress(address: string): boolean;
}
export declare const tokenAddressToSymbolDecimals: TokenAddressToSymbolDecimal;
export declare const contractAddressToNames: ContractAddressToNames;
export declare const ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export declare const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
