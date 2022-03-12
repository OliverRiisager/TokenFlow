"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const model_1 = require("../model");
class ConfigService {
    constructor() {
        this.config = new model_1.Config();
    }
    static getInstance() {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }
    setConfig(configObj) {
        if (configObj.httpGethProvider === undefined) {
            throw new Error('config obj doesnt contain httpGethProvider value');
        }
        this.config = configObj;
    }
    setConfigFromUrl(providerAddress) {
        if (typeof providerAddress !== typeof '') {
            throw new Error('providerAddress is not of correct type');
        }
        if (providerAddress) {
            if (this.config === undefined) {
                this.config = new model_1.Config();
            }
            this.config.httpGethProvider = providerAddress;
        }
        else {
            throw new Error('providerAddress doest not contain a proper string');
        }
    }
}
exports.ConfigService = ConfigService;
//# sourceMappingURL=configService.js.map