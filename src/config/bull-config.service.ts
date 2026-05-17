import { SharedBullConfigurationFactory } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
    constructor(private configService: ConfigService) {}

    createSharedConfiguration(): any {
        return this.configService.config.queue;
    }
}
