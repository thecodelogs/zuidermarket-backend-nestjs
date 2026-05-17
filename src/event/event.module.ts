import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { CalendarEvent } from './event.entity';
import { EventService } from './event.service';
import { UserModule } from '../user/user.module';
import { EventAdminController } from './event-admin/event-admin.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([CalendarEvent]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule,
    ],
    controllers: [EventController, EventAdminController],
    providers: [EventService],
    exports: [EventService],
})
export class EventModule {}
