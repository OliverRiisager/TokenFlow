declare class SymbolDecimal {
    symbol: string;
    decimals: number;
    constructor(symbol: string, decimals: number);
}
declare class TokenAddressToSymbolDecimal {
    tokenAddressToSymbolDecimal: Map<string, SymbolDecimal>;
    constructor();
    AddTokenAddressSymbolDecimal(address: string, symbolDecimal: SymbolDecimal): boolean;
}
declare const tokenAddressToSymbolDecimals: TokenAddressToSymbolDecimal;
declare class ContractAddressToNames {
    contractAddressToNamesMap: Map<string, string>;
    constructor();
    AddContractAddressToNamesMap(address: string, name: string): boolean;
}
declare const contractAddressToNames: ContractAddressToNames;
declare const ethAddress: string;
declare const wethAddress: string;
export { tokenAddressToSymbolDecimals, contractAddressToNames, ethAddress, wethAddress };
//# sourceMappingURL=knownAddresses.d.ts.map