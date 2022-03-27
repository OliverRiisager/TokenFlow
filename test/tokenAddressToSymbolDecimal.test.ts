import { SymbolDecimal, TokenAddressToSymbolDecimal } from "../src";

describe('TokenAddressToSymbolDecimal adding, getting and checking for contained elements', () => {
    
    let tokenAddressSymbols: TokenAddressToSymbolDecimal;
    beforeEach(() => {
        tokenAddressSymbols = new TokenAddressToSymbolDecimal();
    });

    it('Can add elements', () => {
        const tokenTestAddress = 'test';
        expect(tokenAddressSymbols.getTokenSymbolDecimal(tokenTestAddress)).toBe(undefined);
        expect(tokenAddressSymbols.addTokenAddressSymbolDecimal(tokenTestAddress, new SymbolDecimal(tokenTestAddress, 18))).toBe(true);
        expect(tokenAddressSymbols.hasTokenAddress(tokenTestAddress)).toBe(true);
    });
    it('Cannot add same element', () => {
        const tokenTestAddress = 'test';
        expect(tokenAddressSymbols.getTokenSymbolDecimal(tokenTestAddress)).toBe(undefined);
        expect(tokenAddressSymbols.addTokenAddressSymbolDecimal(tokenTestAddress, new SymbolDecimal(tokenTestAddress, 18))).toBe(true);
        expect(tokenAddressSymbols.addTokenAddressSymbolDecimal(tokenTestAddress, new SymbolDecimal(tokenTestAddress, 18))).toBe(false);
        expect(tokenAddressSymbols.hasTokenAddress(tokenTestAddress)).toBe(true);
    });
    it('returns true if element is contained', () => {
        const tokenTestAddress = 'test';
        expect(tokenAddressSymbols.getTokenSymbolDecimal(tokenTestAddress)).toBe(undefined);
        expect(tokenAddressSymbols.addTokenAddressSymbolDecimal(tokenTestAddress, new SymbolDecimal(tokenTestAddress, 18))).toBe(true);
        expect(tokenAddressSymbols.hasTokenAddress(tokenTestAddress)).toBe(true);
    });
})