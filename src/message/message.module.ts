import { Module } from '@nestjs/common';
import { EventMessageModule } from './event-message/event-message.module';
import { StaffMessageModule } from './staff-message/staff-message.module';

@Module({
    imports: [EventMessageModule, StaffMessageModule],
    exports: [EventMessageModule],
})
export class MessageModule {}
