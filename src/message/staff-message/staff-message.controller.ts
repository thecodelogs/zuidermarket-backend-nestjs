import { CreateStaffMessageDto } from './create-staff-message.dto';
import { StaffMessage } from './staff-message.entity';
import {
    Body,
    Controller,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Crud, CrudController } from '@nestjsx/crud';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { UserRole } from 'src/user/types/user-role.type';
import { StaffMessageService } from './staff-message.service';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { IUserJwt } from 'src/user/interfaces/user-jwt.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

const staffRoles: UserRole[] = [
    'admin',
    'board-member',
    'market-lead',
    'market-lead-assistant',
    'member-admin',
    'planner',
    'team-mentor',
    'treasurer',
    'business-owner',
];

@UseGuards(AuthGuard(), RoleGuard)
@Roles(...staffRoles)
@Crud({
    model: {
        type: StaffMessage,
    },
    routes: {
        only: ['getManyBase', 'getOneBase', 'deleteOneBase'],
        getManyBase: { decorators: [Roles(...staffRoles)] },
        deleteOneBase: { decorators: [Roles('admin')] },
    },
    query: {
        join: {
            sentByUser: {
                allow: ['firstName', 'lastName', 'email'],
                eager: true,
            },
        },
    },
})
@ApiBearerAuth()
@Controller('staff-message')
export class StaffMessageController implements CrudController<StaffMessage> {
    constructor(public service: StaffMessageService) {}

    @Post()
    @UsePipes(ValidationPipe)
    createOne(
        @AuthUser() user: IUserJwt,
        @Body() message: CreateStaffMessageDto,
    ) {
        return this.service.addMessage(user, message);
    }
}
