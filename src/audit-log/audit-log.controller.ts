import { AuditLogService } from './audit-log.service';
import { AuditLogLine } from './audit-log.entity';
import { Crud, CrudController } from '@nestjsx/crud';
import { Roles } from './../decorators/role.decorator';
import { RoleGuard } from './../guards/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard(), RoleGuard)
@Roles('admin')
@Crud({
    model: {
        type: AuditLogLine,
    },
    query: {
        alwaysPaginate: true,
        join: {
            user: {
                allow: ['firstName'],
            },
        },
    },
    routes: { only: ['getManyBase', 'getOneBase'] },
})
@ApiBearerAuth()
@Controller('audit-log')
export class AuditLogController implements CrudController<AuditLogLine> {
    constructor(public service: AuditLogService) {}
}
