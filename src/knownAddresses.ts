export class SymbolDecimal {

	symbol : string;
	decimals : number;

	constructor(symbol:string, decimals:number){
		this.symbol = symbol;
		this.decimals = decimals;
	}
}

export class TokenAddressToSymbolDecimal {
	tokenAddressToSymbolDecimal: Map<string, SymbolDecimal>;

	constructor(){
		this.tokenAddressToSymbolDecimal = new Map<string, SymbolDecimal>();
	}

	AddTokenAddressSymbolDecimal(address:string, symbolDecimal:SymbolDecimal) : boolean {
		if(this.tokenAddressToSymbolDecimal.has(address)){
			return false;
		}
		this.tokenAddressToSymbolDecimal.set(address, symbolDecimal);
		return true;
	}

	GetTokenSymbolDecimal(address:string) : SymbolDecimal | null | undefined{
		if(!this.tokenAddressToSymbolDecimal.has(address)){
			return null;
		}
		return this.tokenAddressToSymbolDecimal.get(address);
	}

	HasTokenAddress(address:string):boolean{
		return this.tokenAddressToSymbolDecimal.has(address);
	}
}

export class ContractAddressToNames {
	contractAddressToNamesMap: Map<string, string>;

	constructor(){
		this.contractAddressToNamesMap = new Map<string,string>();
	}

	AddContractAddressToNamesMap(address:string, name:string) : boolean {
		if(this.contractAddressToNamesMap.has(address)){
			return false;
		}
		this.contractAddressToNamesMap.set(address, name);
		return true;
	}

	GetContractName(address:string) : string | undefined | null {
		if(!this.contractAddressToNamesMap.has(address)){
			return null;
		}
		return this.contractAddressToNamesMap.get(address);
	}

	HasContractAddress(address:string):boolean{
		return this.contractAddressToNamesMap.has(address);
	}
}

export const tokenAddressToSymbolDecimals : TokenAddressToSymbolDecimal = new TokenAddressToSymbolDecimal();
tokenAddressToSymbolDecimals.AddTokenAddressSymbolDecimal("unknown", new SymbolDecimal('unknown', 18));
tokenAddressToSymbolDecimals.AddTokenAddressSymbolDecimal("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", new SymbolDecimal('WETH', 18));
tokenAddressToSymbolDecimals.AddTokenAddressSymbolDecimal("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", new SymbolDecimal('ETH', 18));
tokenAddressToSymbolDecimals.AddTokenAddressSymbolDecimal("0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", new SymbolDecimal('MKR', 18));

export const contractAddressToNames : ContractAddressToNames = new ContractAddressToNames();

contractAddressToNames.AddContractAddressToNamesMap("unknown", "unknown");
contractAddressToNames.AddContractAddressToNamesMap("0x0000000000000000000000000000000000000000", "Address zero");
contractAddressToNames.AddContractAddressToNamesMap("0x11111254369792b2ca5d084ab5eea397ca8fa48b", "1inch.exchange");
contractAddressToNames.AddContractAddressToNamesMap("0x111111125434b319222cdbf8c261674adb56f3ae", "1inch.exchange v2");
contractAddressToNames.AddContractAddressToNamesMap("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "WETH contract");
contractAddressToNames.AddContractAddressToNamesMap("0x7c66550c9c730b6fdd4c03bc2e73c5462c5f7acc", "Kyber, Contract 2");
contractAddressToNames.AddContractAddressToNamesMap("0x9aab3f75489902f3a48495025729a0af77d4b11e", "Kyber, Proxy 2");
contractAddressToNames.AddContractAddressToNamesMap("0xd3d2b5643e506c6d9b7099e9116d7aaa941114fe", "Kyber, Fee Handler");
contractAddressToNames.AddContractAddressToNamesMap("0xa5407eae9ba41422680e2e00537571bcc53efbfd", "Curve.fi, sUSD v2 Swap");
contractAddressToNames.AddContractAddressToNamesMap("0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7", "Curve.fi, DAI/USDC/USDT Pool");
contractAddressToNames.AddContractAddressToNamesMap("0xc409d34accb279620b1acdc05e408e287d543d17", "Balancer, WBTC/renBTC/ETH 45/35/20 #2");
contractAddressToNames.AddContractAddressToNamesMap("0xee9a6009b926645d33e10ee5577e9c8d3c95c165", "Balancer, WBTC/ETH 50/50 #5");
contractAddressToNames.AddContractAddressToNamesMap("0x221bf20c2ad9e5d7ec8a9d1991d8e2edcfcb9d6c", "Balancer, WBTC/ETH 50/50 #9");
contractAddressToNames.AddContractAddressToNamesMap("0x8b6e6e7b5b3801fed2cafd4b22b8a16c2f2db21a", "Balancer, DAI/ETH 20/80");
contractAddressToNames.AddContractAddressToNamesMap("0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "Uniswap V2, DAI 2");
contractAddressToNames.AddContractAddressToNamesMap("0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852", "Uniswap V2, USDT 2");
contractAddressToNames.AddContractAddressToNamesMap("0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc", "Uniswap V2, USDC 3");
contractAddressToNames.AddContractAddressToNamesMap("0x2fdbadf3c4d5a8666bc06645b8358ab803996e28", "Uniswap V2, YFI 8");
contractAddressToNames.AddContractAddressToNamesMap("0x81fbef4704776cc5bba0a5df3a90056d2c6900b3", "Uniswap V2, renBTC 2");
contractAddressToNames.AddContractAddressToNamesMap("0xbb2b8038a1640196fbe3e38816f3e67cba72d940", "Uniswap V2, WBTC 2");
contractAddressToNames.AddContractAddressToNamesMap("0xceff51756c56ceffca006cd410b03ffc46dd3a58", "SushiSwap V2, WBTC");
contractAddressToNames.AddContractAddressToNamesMap("0x06da0fd433c1a5d7a4faa01111c044910a184553", "SushiSwap V2, USDT");
contractAddressToNames.AddContractAddressToNamesMap("0xa1d7b2d891e3a1f9ef4bbc5be20630c2feb1c470", "SushiSwap V2, SNX");
contractAddressToNames.AddContractAddressToNamesMap("0x088ee5007c98a9677165d78dd2109ae4a3d04d0c", "SushiSwap: YFI");


export const ethAddress:string = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const wethAddress:string = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";