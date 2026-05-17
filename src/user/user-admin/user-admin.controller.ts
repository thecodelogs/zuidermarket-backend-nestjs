import { UserService } from './../user.service';
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Crud, CrudController } from '@nestjsx/crud';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { User } from '../user.entity';

@UseGuards(AuthGuard(), RoleGuard)
@Roles('admin', 'member-admin')
@Crud({
    model: {
        type: User,
    },
    query: {
        exclude: ['password'],
        alwaysPaginate: true,
        join: {
            team: {
                persist: ['name'],
                eager: true,
            },
            auditLogLines: {},
        },
    },
})
@Controller('user-admin')
export class UserAdminController implements CrudController<User> {
    constructor(public service: UserService) {}
}
