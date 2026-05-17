import { MailModule } from './../mail/mail.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEvent } from 'src/event/event.entity';
import { NotificationController } from './notification.controller';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { EventModule } from 'src/event/event.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, CalendarEvent]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        MailModule,
        EventModule,
    ],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
