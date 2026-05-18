import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from './config.service';
import { IOrmConfig } from './interfaces/app-config.interface';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    private readonly logger = new Logger(TypeOrmConfigService.name);
    private readonly config: IOrmConfig;

    constructor(configService: ConfigService) {
        this.config = configService.config.orm;
    }

    createTypeOrmOptions(): TypeOrmModuleOptions {
        const env = {
            DB_TYPE: process.env.DB_TYPE,
            DB_HOST: process.env.DB_HOST,
            DB_PORT: process.env.DB_PORT,
            DB_USERNAME: process.env.DB_USERNAME,
            DB_DATABASE: process.env.DB_DATABASE,
            DB_PASSWORD_SET: Boolean(process.env.DB_PASSWORD),
            DB_PASSWORD_LENGTH: process.env.DB_PASSWORD?.length ?? 0,
        };

        this.logger.warn(
            `MySQL connection (from config package → TypeORM): ` +
                JSON.stringify({
                    type: this.config.type,
                    host: this.config.host,
                    port: this.config.port,
                    username: this.config.username,
                    database: this.config.database,
                    passwordSet: Boolean(this.config.password),
                    passwordLength: this.config.password?.length ?? 0,
                    synchronize: this.config.synchronize,
                    logging: this.config.logging,
                }),
        );
        this.logger.warn(
            `MySQL env vars (.env / process.env): ${JSON.stringify(env)}`,
        );

        // @ts-ignore
        return {
            ...this.config,
            ssl: {
                rejectUnauthorized: false,
            },
            extra: {
                ssl: {
                    rejectUnauthorized: false,
                },
            },
        };
    }
}
