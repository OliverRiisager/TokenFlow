export declare class SymbolDecimal {
    symbol: string;
    decimals: number;
    constructor(symbol: string, decimals: number);
}
export declare class TokenAddressToSymbolDecimal {
    tokenAddressToSymbolDecimal: Map<string, SymbolDecimal>;
    constructor();
    AddTokenAddressSymbolDecimal(address: string, symbolDecimal: SymbolDecimal): boolean;
    GetTokenSymbolDecimal(address: string): SymbolDecimal | null | undefined;
    HasTokenAddress(address: string): boolean;
}
export declare class ContractAddressToNames {
    contractAddressToNamesMap: Map<string, string>;
    constructor();
    AddContractAddressToNamesMap(address: string, name: string): boolean;
    GetContractName(address: string): string | undefined | null;
    HasContractAddress(address: string): boolean;
}
export declare const tokenAddressToSymbolDecimals: TokenAddressToSymbolDecimal;
export declare const contractAddressToNames: ContractAddressToNames;
export declare const ethAddress: string;
export declare const wethAddress: string;
//# sourceMappingURL=knownAddresses.d.ts.map