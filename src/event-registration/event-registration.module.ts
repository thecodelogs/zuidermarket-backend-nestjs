import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { EventRegistrationController } from './event-registration.controller';
import { EventRegistrationService } from './event-registration.service';
import { EventRegistration } from './event-registration.entity';
import { EventRegistrationAdminController } from './event-registration-admin/event-registration-admin.controller';
import { EventRegistrationAdminService } from './event-registration-admin/event-registration-admin.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventRegistration]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule,
    ],
    controllers: [
        EventRegistrationController,
        EventRegistrationAdminController,
    ],
    providers: [EventRegistrationService, EventRegistrationAdminService],
})
export class EventRegistrationModule {}
