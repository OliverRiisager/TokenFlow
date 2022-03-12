import { Config } from '../model';
export declare class ConfigService {
    static instance: ConfigService;
    config: Config;
    static getInstance(): ConfigService;
    setConfig(configObj: Config): void;
    setConfigFromUrl(providerAddress: string): void;
}
