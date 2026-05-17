import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from './config.service';
import { IOrmConfig } from './interfaces/app-config.interface';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    private readonly config: IOrmConfig;
    constructor(configService: ConfigService) {
        this.config = configService.config.orm;
    }

    createTypeOrmOptions(): TypeOrmModuleOptions {
        // @ts-ignore
        return this.config;
    }
}
