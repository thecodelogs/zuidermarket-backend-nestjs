import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rsvp } from 'src/rsvp/rsvp.entity';
import { UserModule } from 'src/user/user.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { EventModule } from 'src/event/event.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Rsvp]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        EventModule,
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService],
})
export class AttendanceModule {}
