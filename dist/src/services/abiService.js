"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbiService = void 0;
const tslib_1 = require("tslib");
const erc20_json_1 = tslib_1.__importDefault(require("../../public/abis/erc20.json"));
const wrappedEther_json_1 = tslib_1.__importDefault(require("../../public/abis/wrappedEther.json"));
class AbiService {
    constructor() {
        this.erc20abi = erc20_json_1.default;
        this.weth20abi = wrappedEther_json_1.default;
    }
    static getInstance() {
        if (!AbiService.instance) {
            AbiService.instance = new AbiService();
        }
        return AbiService.instance;
    }
}
exports.AbiService = AbiService;
//# sourceMappingURL=abiService.js.map