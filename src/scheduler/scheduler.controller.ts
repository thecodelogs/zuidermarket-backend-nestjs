import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { SchedulerService } from './scheduler.service';
import { CalendarEvent } from 'src/event/event.entity';

@UseGuards(AuthGuard(), RoleGuard)
@Roles('admin', 'planner')
@Controller('scheduler')
export class SchedulerController {
    constructor(private schedulerService: SchedulerService) {}

    @Get('proposal/:year')
    getProposal(@Param('year') year: number) {
        return this.schedulerService.getProposal(year);
    }

    @Post('schedule')
    saveSchedule(@Body() events: CalendarEvent[]) {
        return this.schedulerService.saveSchedule(events);
    }

    @Post('slots/:year')
    generateSaturdaySlots(@Param('year') year: number) {
        return this.schedulerService.generateSaturdaySlots(year);
    }
}
