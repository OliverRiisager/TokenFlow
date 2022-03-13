import {Config} from '../model';

export class ConfigService {
    static instance: ConfigService;

    private config: Config = new Config();

    static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }

        return ConfigService.instance;
    }

    getConfig(): Config {
        return this.config;
    }

    setConfigFromUrl(providerAddress: string): void {
        if (typeof providerAddress !== typeof '') {
            throw new Error('providerAddress is not of correct type');
        }
        if (providerAddress) {
            if (this.config === undefined) {
                this.config = new Config();
            }
            this.config.httpGethProvider = providerAddress;
        } else {
            throw new Error(
                'providerAddress doest not contain a proper string'
            );
        }
    }
}
