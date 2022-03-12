import erc20abi from '../../public/abis/erc20.json';
import weth20abi from '../../public/abis/wrappedEther.json';

export class AbiService {
    static instance: AbiService;

    erc20abi: any;

    weth20abi: any;

    constructor() {
        this.erc20abi = erc20abi;
        this.weth20abi = weth20abi;
    }

    static getInstance(): AbiService {
        if (!AbiService.instance) {
            AbiService.instance = new AbiService();
        }

        return AbiService.instance;
    }
}
