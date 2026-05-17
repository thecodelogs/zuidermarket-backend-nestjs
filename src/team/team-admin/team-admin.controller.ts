import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    Crud,
    CrudController,
    CrudRequest,
    Override,
    ParsedRequest,
} from '@nestjsx/crud';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { Team } from '../team.entity';
import { TeamService } from '../team.service';

@UseGuards(AuthGuard(), RoleGuard)
@Roles('admin', 'member-admin', 'planner')
@Crud({
    model: {
        type: Team,
    },
    query: {
        join: {
            users: {
                eager: true,
                exclude: ['password'],
            },
            events: {
                eager: false,
            },
            eventRegistrations: {},
            'eventRegistrations.event': {},
        },
    },
})
@Controller('team-admin')
export class TeamAdminController implements CrudController<Team> {
    constructor(public service: TeamService) {}

    get base(): CrudController<Team> {
        return this;
    }

    @Override()
    getMany(@ParsedRequest() req: CrudRequest) {
        this.service.removeCustomFields(req);
        if (this.service.isCustomSort(req)) {
            return this.service.sortByCustomField(this.base, req);
        }
        return this.base.getManyBase(req);
    }
}
