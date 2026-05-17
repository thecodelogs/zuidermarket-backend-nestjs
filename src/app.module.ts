import { AuditInterceptor } from './interceptors/audit.interceptor';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { BullConfigService } from './config/bull-config.service';
import { ConfigModule } from './config/config.module';
import { TypeOrmConfigService } from './config/typeorm-config.service';
import { WinstonConfigService } from './config/winston-config.service';
import { EventRegistrationModule } from './event-registration/event-registration.module';
import { EventModule } from './event/event.module';
import { FeedbackModule } from './feedback/feedback.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { PayloadLoggingInterceptor } from './interceptors/payload-logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { TimingInterceptor } from './interceptors/timing.interceptor';
import { MailModule } from './mail/mail.module';
import { MarketLeadModule } from './market-lead/market-lead.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';
import { RsvpModule } from './rsvp/rsvp.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SharedModule } from './shared/shared.module';
import { TeamModule } from './team/team.module';
import { TodoModule } from './todo/todo.module';
import { UserModule } from './user/user.module';
import { WeatherModule } from './weather/weather.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NewUserModule } from './new-user/new-user.module';
import { MollieModule } from './mollie/mollie.module';

@Module({
    imports: [
        ConfigModule,
        UserModule,
        SharedModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useExisting: TypeOrmConfigService,
        }),
        WinstonModule.forRootAsync({
            useClass: WinstonConfigService,
        }),
        BullModule.forRootAsync({
            useClass: BullConfigService,
        }),
        ThrottlerModule.forRoot(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ScheduleModule.forRoot(),
        AuthModule,
        TeamModule,
        RsvpModule,
        EventModule,
        FeedbackModule,
        TodoModule,
        NotificationModule,
        MailModule,
        WeatherModule,
        EventRegistrationModule,
        SchedulerModule,
        AttendanceModule,
        MessageModule,
        MarketLeadModule,
        AuditLogModule,
        NewUserModule,
        MollieModule,
    ],
    controllers: [AppController],
    providers: [
        TimingInterceptor,
        TimeoutInterceptor,
        PayloadLoggingInterceptor,
        HttpExceptionFilter,
        AuditInterceptor,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
