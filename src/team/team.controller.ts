import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    Crud,
    CrudController,
    CrudRequest,
    Override,
    ParsedRequest,
} from '@nestjsx/crud';
import { Team } from './team.entity';
import { TeamService } from './team.service';

@Crud({
    model: {
        type: Team,
    },
    routes: {
        only: ['getManyBase', 'getOneBase'],
    },
})
@Controller('team')
export class TeamController implements CrudController<Team> {
    constructor(public service: TeamService) {}

    get base(): CrudController<Team> {
        return this;
    }

    @Get('get-team-names')
    getNames() {
        return this.service.getNames();
    }

    @UseGuards(AuthGuard())
    @Override()
    getMany(@ParsedRequest() req: CrudRequest) {
        this.service.removeCustomFields(req);
        if (this.service.isCustomSort(req)) {
            return this.service.sortByCustomField(this.base, req);
        }
        return this.base.getManyBase(req);
    }
}
