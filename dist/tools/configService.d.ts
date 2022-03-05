import { config } from '../config';
declare class configService {
    config: config;
    static instance: configService;
    constructor();
    static getInstance(): configService;
    setConfig(configObj: config): void;
    setConfigFromAddress(providerAddress: any): void;
}
export { configService };
//# sourceMappingURL=configService.d.ts.map