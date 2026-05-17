import { Team } from 'src/team/team.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    CrudController,
    CrudRequest,
    GetManyDefaultResponse,
} from '@nestjsx/crud';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TeamService extends TypeOrmCrudService<Team> {
    private readonly customFields = ['health', 'memberCount'];
    constructor(@InjectRepository(Team) repo) {
        super(repo);
    }

    getNames(): Promise<string[]> {
        return this.repo
            .find({
                select: ['name'],
                where: { test: 'false' },
            })
            .then((teams) => {
                teams.filter((team) => team.test);
                return teams.map((team) => team.name);
            });
    }

    removeCustomFields(req: CrudRequest) {
        const ors = req.parsed.or;
        req.parsed.or = ors.filter(
            (or) => !this.customFields.includes(or.field),
        );
    }

    isCustomSort(req: CrudRequest): boolean {
        const sorts = req.parsed.sort;
        if (!sorts) {
            return false;
        }
        return this.customFields.some((field) =>
            sorts.some((sort) => sort.field === field),
        );
    }

    sortByCustomField(base: CrudController<Team>, req: CrudRequest) {
        const sort = req.parsed.sort[0];
        const field = sort.field;
        const desc = sort.order === 'DESC';
        const sortFn = (a: Team, b: Team) =>
            desc ? b[field] - a[field] : a[field] - b[field];
        req.parsed.sort = null;
        return from(base.getManyBase(req)).pipe(
            map((res) => this.sortResponse(res, sortFn)),
        );
    }

    sortResponse(
        res: GetManyDefaultResponse<Team> | Team[],
        sortFn: any,
    ): GetManyDefaultResponse<Team> | Team[] {
        if (Array.isArray(res)) {
            return (res as Team[]).sort(sortFn);
        }
        (res as GetManyDefaultResponse<Team>).data = (
            res as GetManyDefaultResponse<Team>
        ).data.sort(sortFn);
        return res;
    }
}
