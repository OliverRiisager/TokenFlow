import { Config } from './model';
export declare class ConfigService {
    config: Config;
    static instance: ConfigService;
    constructor();
    static getInstance(): ConfigService;
    setConfig(configObj: Config): void;
    setConfigFromUrl(providerAddress: string): void;
}
//# sourceMappingURL=configService.d.ts.map