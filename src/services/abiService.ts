import erc20abi from '../../public/abis/erc20.json';
import weth20abi from '../../public/abis/wrappedEther.json';

export class AbiService {
    static instance: AbiService;

    private erc20abi: any;

    private weth20abi: any;

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

    getErc20Abi():any {
        return this.erc20abi;
    }
    getWeth20abiAbi():any {
        return this.weth20abi;
    }
}
