import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MailConsumer } from './mail.processor';
import { MailService } from './mail.service';

const queueOptions = {
    name: 'mail',
    limiter: {
        max: 1,
        duration: 2000,
    },
} as BullModuleOptions;

@Module({
    imports: [BullModule.registerQueue(queueOptions)],
    providers: [MailService, MailConsumer],
    exports: [MailService],
})
export class MailModule {}
