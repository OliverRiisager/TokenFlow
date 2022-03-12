// @ts-ignore
import abiDecoder from 'abi-decoder';

export class AbiDecoderService {
    static instance: AbiDecoderService;

    abiDecoder: any;

    constructor() {
        this.abiDecoder = abiDecoder;
    }

    static getInstance(): AbiDecoderService {
        if (!AbiDecoderService.instance) {
            AbiDecoderService.instance = new AbiDecoderService();
        }

        return AbiDecoderService.instance;
    }
}
