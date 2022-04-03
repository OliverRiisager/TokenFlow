http://tokenflow.xyz

# Example Usage setup:

To use this tool you have to create an instance of TraceProcessor.
The TraceProcessor takes an instance of a providerConnector.

let traceProcessorInstance = new TraceProcessor({YOUR PROVIDERCONNECTOR INSTANCE})

You can either implement your own providerConnector or use the supplied Web3 provider.

The ProviderConnector allows you to specify wether or not it should translate contract names, token symbols and decimals.
To enable translation you need to implement both resolveContractNamesAndTokenSymbolDecimals and resolveContractNamesSymbolsAndDecimals.
Where resolveContractNamesAndTokenSymbolDecimals returns a boolean - true if you want to have it translate and false if you dont.
resolveContractNamesSymbolsAndDecimals is the where you should then implement the translation of these values.

To then get the transaction trace, you simply call getTransfers on your traceProcessor instance. Where you just pass in the txhash for the wanted transaction.
The getTransfers call returns a Promise containing TransfersNodes.

# Test transactions:

_Swap Eth to ERC20 (WBTC)._
0xc44e8bd76bec69ff305f0fcc3dccb2965970e145ffc083e0c27a22a06542f528

_Swap eth to ERC20 (USDT). Small_
0xde3db72870ee89ed21650b6874d74e139a3249b09dd380262271eb50316b0b2d

_Swap ERC20 (AKRO) to Eth, multiple eth transfers_
0x8d720401121afe4524bb7f6a9842af5cb347e19da9784bbc9419ec53eb563b29

_Swap eth to ERC20 (MKR) with balance, multiple eth transfers_
0x2e153f44f67835c4f2a85f70efe04e157c932bb5088128a4bf2ac0d41c0e1e0d

_Swap ERC20 (OCEAN) to eth, multiple eth transfers_
0x9639078bd27009822013c7718a1120ceaada3503b80644c9ec23f056a5337f73

_Swap ERC20 (REN) to eth_
0x38722e725f3ad157fb14a204891158de987a89eca58406a0911a182552e938c9

_Swap ERC20 (DAI) to ERC20 (BAC) with CHI burning_
0x77290eaad5271396a9610e0f852acabb8dae9a608f6236c6be1b3f1200f6dede

_Swap ERC20 (USDT) to eth with CHI burning_
0x1b690cc63824f68ee5e39d2cde8ac9c88139315ba79e76adc7dc9933daea40aa

_Swap eth to ERC20 (ALEPH)_
0xcc291510957b2a8c05d6b90a040a8a22766eee8522959600bdf4ef40ab510474
