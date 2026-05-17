import { EventService } from './../event.service';
import { CalendarEvent } from './../event.entity';
import { Crud, CrudController } from '@nestjsx/crud';
import { Roles } from './../../decorators/role.decorator';
import { RoleGuard } from './../../guards/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Controller, UseGuards } from '@nestjs/common';

@UseGuards(AuthGuard(), RoleGuard)
@Roles('admin', 'planner')
@Crud({
    model: {
        type: CalendarEvent,
    },
    query: {
        join: {
            team: {
                allow: ['name'],
                eager: true,
            },
            rsvps: {
                allow: ['response', 'userId', 'createdAt', 'overlappingShift'],
                eager: true,
            },
            registrations: {
                eager: true,
            },
            messages: {
                allow: ['id', 'createdAt', 'subject', 'body', 'recipientGroup'],
            },
            'messages.sentByUser': {
                allow: ['id', 'firstName', 'lastName', 'email'],
            },
            'rsvps.user': {
                allow: [
                    'firstName',
                    'lastName',
                    'teamId',
                    'carryingCapacity',
                    'prefersOverlappingShift',
                    'hasMarketDuty',
                ],
            },
            'team.users': {
                allow: [
                    'firstName',
                    'lastName',
                    'carryingCapacity',
                    'prefersOverlappingShift',
                    'hasMarketDuty',
                    'dateOfBirth',
                    'gender',
                ],
            },
            'registrations.team': {
                alias: 'registrationsTeam',
            },
            'registrations.team.users': {
                alias: 'registrationsTeamUsers',
                allow: [
                    'firstName',
                    'lastName',
                    'carryingCapacity',
                    'prefersOverlappingShift',
                    'hasMarketDuty',
                    'dateOfBirth',
                    'gender',
                ],
            },
        },
    },
    routes: {
        createOneBase: { decorators: [Roles('admin', 'planner')] },
        createManyBase: { decorators: [Roles('admin', 'planner')] },
        getManyBase: { decorators: [Roles('member')] },
        getOneBase: { decorators: [Roles('member')] },
        updateOneBase: { decorators: [Roles('admin', 'planner')] },
        deleteOneBase: { decorators: [Roles('admin', 'planner')] },
    },
})
@Controller('event-admin')
export class EventAdminController implements CrudController<CalendarEvent> {
    constructor(public service: EventService) {}
}
