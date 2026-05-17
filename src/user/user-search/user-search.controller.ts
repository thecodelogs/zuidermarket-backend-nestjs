import { RoleGuard } from './../../guards/role.guard';
import { Roles } from './../../decorators/role.decorator';
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Crud, CrudController } from '@nestjsx/crud';
import { UserService } from 'src/user/user.service';
import { User } from './../user.entity';

@UseGuards(AuthGuard(), RoleGuard)
@Roles(
    'admin',
    'market-lead',
    'market-lead-assistant',
    'board-member',
    'planner',
    'member-admin',
)
@Crud({
    model: {
        type: User,
    },
    query: {
        allow: ['firstName', 'lastName', 'lastNamePrefix', 'phone', 'email'],
        alwaysPaginate: true,
        join: {
            team: {
                allow: ['name'],
            },
        },
    },
    routes: {
        only: ['getManyBase'],
    },
})
@Controller('user-search')
export class UserSearchController implements CrudController<User> {
    constructor(public service: UserService) {}
}
