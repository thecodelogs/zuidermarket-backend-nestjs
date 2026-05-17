import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './../../mail/mail.module';
import { EventMessage } from './event-message.entity';
import { EventMessageService } from './event-message.service';
import { EventMessageController } from './event-message.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventMessage]),
        MailModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    providers: [EventMessageService],
    exports: [EventMessageService],
    controllers: [EventMessageController],
})
export class EventMessageModule {}
