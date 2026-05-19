import { EventRegistrationAdminService } from './event-registration-admin.service';
import { EventRegistration } from './../event-registration.entity';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from './../../guards/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard(), RoleGuard)
@Roles('planner', 'admin')
@Crud({
    model: {
        type: EventRegistration,
    },
    query: {
        join: {
            team: {
                allow: ['name'],
                eager: true,
            },
            event: {
                eager: true,
            },
            'event.team': {
                eager: true,
                alias: 'eventTeam',
            },
        },
    },
})
@ApiBearerAuth()
@Controller('event-registration-admin')
export class EventRegistrationAdminController
    implements CrudController<EventRegistration>
{
    constructor(public service: EventRegistrationAdminService) {}
}
