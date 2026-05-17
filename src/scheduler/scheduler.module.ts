import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEvent } from 'src/event/event.entity';
import { Team } from 'src/team/team.entity';
import { ProposalService } from './proposal/proposal.service';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Team, CalendarEvent]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [SchedulerController],
    providers: [SchedulerService, ProposalService],
})
export class SchedulerModule {}
