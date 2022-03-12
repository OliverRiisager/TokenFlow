"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wethAddress = exports.ethAddress = exports.contractAddressToNames = exports.tokenAddressToSymbolDecimals = exports.ContractAddressToNames = exports.TokenAddressToSymbolDecimal = exports.SymbolDecimal = void 0;
class SymbolDecimal {
    constructor(symbol, decimals) {
        this.symbol = symbol;
        this.decimals = decimals;
    }
}
exports.SymbolDecimal = SymbolDecimal;
class TokenAddressToSymbolDecimal {
    constructor() {
        this.tokenAddressToSymbolDecimal = new Map();
    }
    addTokenAddressSymbolDecimal(address, symbolDecimal) {
        if (this.tokenAddressToSymbolDecimal.has(address)) {
            return false;
        }
        this.tokenAddressToSymbolDecimal.set(address, symbolDecimal);
        return true;
    }
    getTokenSymbolDecimal(address) {
        if (!this.tokenAddressToSymbolDecimal.has(address)) {
            return undefined;
        }
        return this.tokenAddressToSymbolDecimal.get(address);
    }
    hasTokenAddress(address) {
        return this.tokenAddressToSymbolDecimal.has(address);
    }
}
exports.TokenAddressToSymbolDecimal = TokenAddressToSymbolDecimal;
class ContractAddressToNames {
    constructor() {
        this.contractAddressToNamesMap = new Map();
    }
    addContractAddressToNamesMap(address, name) {
        if (this.contractAddressToNamesMap.has(address)) {
            return false;
        }
        this.contractAddressToNamesMap.set(address, name);
        return true;
    }
    getContractName(address) {
        if (!this.contractAddressToNamesMap.has(address)) {
            return undefined;
        }
        return this.contractAddressToNamesMap.get(address);
    }
    hasContractAddress(address) {
        return this.contractAddressToNamesMap.has(address);
    }
}
exports.ContractAddressToNames = ContractAddressToNames;
exports.tokenAddressToSymbolDecimals = new TokenAddressToSymbolDecimal();
exports.tokenAddressToSymbolDecimals.addTokenAddressSymbolDecimal('unknown', new SymbolDecimal('unknown', 18));
exports.tokenAddressToSymbolDecimals.addTokenAddressSymbolDecimal('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', new SymbolDecimal('WETH', 18));
exports.tokenAddressToSymbolDecimals.addTokenAddressSymbolDecimal('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', new SymbolDecimal('ETH', 18));
exports.tokenAddressToSymbolDecimals.addTokenAddressSymbolDecimal('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', new SymbolDecimal('MKR', 18));
exports.contractAddressToNames = new ContractAddressToNames();
exports.contractAddressToNames.addContractAddressToNamesMap('unknown', 'unknown');
exports.contractAddressToNames.addContractAddressToNamesMap('0x0000000000000000000000000000000000000000', 'Address zero');
exports.contractAddressToNames.addContractAddressToNamesMap('0x11111254369792b2ca5d084ab5eea397ca8fa48b', '1inch.exchange');
exports.contractAddressToNames.addContractAddressToNamesMap('0x111111125434b319222cdbf8c261674adb56f3ae', '1inch.exchange v2');
exports.contractAddressToNames.addContractAddressToNamesMap('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'WETH contract');
exports.contractAddressToNames.addContractAddressToNamesMap('0x7c66550c9c730b6fdd4c03bc2e73c5462c5f7acc', 'Kyber, Contract 2');
exports.contractAddressToNames.addContractAddressToNamesMap('0x9aab3f75489902f3a48495025729a0af77d4b11e', 'Kyber, Proxy 2');
exports.contractAddressToNames.addContractAddressToNamesMap('0xd3d2b5643e506c6d9b7099e9116d7aaa941114fe', 'Kyber, Fee Handler');
exports.contractAddressToNames.addContractAddressToNamesMap('0xa5407eae9ba41422680e2e00537571bcc53efbfd', 'Curve.fi, sUSD v2 Swap');
exports.contractAddressToNames.addContractAddressToNamesMap('0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7', 'Curve.fi, DAI/USDC/USDT Pool');
exports.contractAddressToNames.addContractAddressToNamesMap('0xc409d34accb279620b1acdc05e408e287d543d17', 'Balancer, WBTC/renBTC/ETH 45/35/20 #2');
exports.contractAddressToNames.addContractAddressToNamesMap('0xee9a6009b926645d33e10ee5577e9c8d3c95c165', 'Balancer, WBTC/ETH 50/50 #5');
exports.contractAddressToNames.addContractAddressToNamesMap('0x221bf20c2ad9e5d7ec8a9d1991d8e2edcfcb9d6c', 'Balancer, WBTC/ETH 50/50 #9');
exports.contractAddressToNames.addContractAddressToNamesMap('0x8b6e6e7b5b3801fed2cafd4b22b8a16c2f2db21a', 'Balancer, DAI/ETH 20/80');
exports.contractAddressToNames.addContractAddressToNamesMap('0xa478c2975ab1ea89e8196811f51a7b7ade33eb11', 'Uniswap V2, DAI 2');
exports.contractAddressToNames.addContractAddressToNamesMap('0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852', 'Uniswap V2, USDT 2');
exports.contractAddressToNames.addContractAddressToNamesMap('0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc', 'Uniswap V2, USDC 3');
exports.contractAddressToNames.addContractAddressToNamesMap('0x2fdbadf3c4d5a8666bc06645b8358ab803996e28', 'Uniswap V2, YFI 8');
exports.contractAddressToNames.addContractAddressToNamesMap('0x81fbef4704776cc5bba0a5df3a90056d2c6900b3', 'Uniswap V2, renBTC 2');
exports.contractAddressToNames.addContractAddressToNamesMap('0xbb2b8038a1640196fbe3e38816f3e67cba72d940', 'Uniswap V2, WBTC 2');
exports.contractAddressToNames.addContractAddressToNamesMap('0xceff51756c56ceffca006cd410b03ffc46dd3a58', 'SushiSwap V2, WBTC');
exports.contractAddressToNames.addContractAddressToNamesMap('0x06da0fd433c1a5d7a4faa01111c044910a184553', 'SushiSwap V2, USDT');
exports.contractAddressToNames.addContractAddressToNamesMap('0xa1d7b2d891e3a1f9ef4bbc5be20630c2feb1c470', 'SushiSwap V2, SNX');
exports.contractAddressToNames.addContractAddressToNamesMap('0x088ee5007c98a9677165d78dd2109ae4a3d04d0c', 'SushiSwap: YFI');
exports.ethAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
exports.wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
//# sourceMappingURL=knownAddresses.js.map