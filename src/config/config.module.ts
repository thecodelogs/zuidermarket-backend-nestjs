import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { TypeOrmConfigService } from './typeorm-config.service';
import { WinstonConfigService } from './winston-config.service';

@Global()
@Module({
    providers: [ConfigService, WinstonConfigService, TypeOrmConfigService],
    exports: [ConfigService, WinstonConfigService, TypeOrmConfigService],
})
export class ConfigModule {}
