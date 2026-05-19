import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Crud, CrudController } from '@nestjsx/crud';
import { Roles } from '../decorators/role.decorator';
import { RoleGuard } from '../guards/role.guard';
import { Todo } from './todo.entity';
import { TodoService } from './todo.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard(), RoleGuard)
@Crud({
    model: {
        type: Todo,
    },
    query: {
        join: {
            assignee: {
                allow: ['firstName', 'lastName'],
                eager: true,
            },
        },
    },
})
@Roles('market-lead', 'admin', 'board-member', 'planner', 'member-admin')
@ApiBearerAuth()
@Controller('todo')
export class TodoController implements CrudController<Todo> {
    constructor(public service: TodoService) {}
}
