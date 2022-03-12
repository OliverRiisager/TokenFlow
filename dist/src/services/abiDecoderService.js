"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbiDecoderService = void 0;
const tslib_1 = require("tslib");
// @ts-ignore
const abi_decoder_1 = tslib_1.__importDefault(require("abi-decoder"));
class AbiDecoderService {
    constructor() {
        this.abiDecoder = abi_decoder_1.default;
    }
    static getInstance() {
        if (!AbiDecoderService.instance) {
            AbiDecoderService.instance = new AbiDecoderService();
        }
        return AbiDecoderService.instance;
    }
}
exports.AbiDecoderService = AbiDecoderService;
//# sourceMappingURL=abiDecoderService.js.map