import { EventModule } from './../event/event.module';
import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RsvpController } from './rsvp.controller';
import { Rsvp } from './rsvp.entity';
import { RsvpService } from './rsvp.service';
import { TeamModule } from 'src/team/team.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Rsvp]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule,
        EventModule,
        TeamModule,
    ],
    controllers: [RsvpController],
    providers: [RsvpService],
    exports: [RsvpService],
})
export class RsvpModule {}
