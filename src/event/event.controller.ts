import { Controller, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Crud, CrudController } from '@nestjsx/crud';
import { CalendarEvent } from './event.entity';
import { EventService } from './event.service';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { AuthUser } from '../decorators/auth-user.decorator';
import { IUserJwt } from '../user/interfaces/user-jwt.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard(), RoleGuard)
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
                allow: ['teamId', 'updatedAt'],
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
                ],
            },
            'registrations.team': {
                alias: 'registrationsTeam',
                allow: ['name'],
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
@ApiBearerAuth()
@Controller('event')
export class EventController implements CrudController<CalendarEvent> {
    constructor(public service: EventService) {}

    @Get('my-team')
    getMyTeamEvents(@AuthUser() user: IUserJwt) {
        return this.service.getMyTeamEvents(user);
    }

    @Get('my-team/past')
    getMyTeamPastEvents(@AuthUser() user: IUserJwt) {
        return this.service.getMyTeamsPastEvents(user);
    }

    @Get('my-team/future')
    getMyTeamFutureEvents(@AuthUser() user: IUserJwt) {
        return this.service.getMyTeamsFutureEvents(user);
    }
}
