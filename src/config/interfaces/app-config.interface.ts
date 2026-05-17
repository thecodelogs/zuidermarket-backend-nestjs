import { QueueOptions } from 'bull';
import { IMailConfig } from './smtp-config.interface';

export interface IAppConfig {
    port: number;
    apiUrl: string;
    enableDocs: boolean;
    frontendUrl: string;
    jwt: IJwtConfig;
    mail: IMailConfig;
    logging: ILogConfig;
    orm: IOrmConfig;
    weather: IWeatherConfig;
    mollie: IMollieConfig;
    queue: QueueOptions;
}

export interface IOrmConfig {
    type: string;
    host: string;
    port: number;
    username: string;
    database: string;
    password: string;
    entities: string[];
    synchronize: boolean;
    logging: boolean;
}

type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error';

export interface ILogConfig {
    level: LogLevel;
    file: {
        path: string;
        level?: LogLevel;
    };
    console: {
        level?: LogLevel;
    };
    slack: {
        webhookUrl: string;
        level?: LogLevel;
        channel?: string;
    };
}

export interface IJwtConfig {
    accessToken: ITokenConfig;
}

export interface ITokenConfig {
    secret: string;
    expiresIn: string;
}

export interface IWeatherConfig {
    apiKey: string;
}

export interface IMollieConfig {
    apiKey: string;
}
