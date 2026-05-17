import { IUserJwt } from './../../user/interfaces/user-jwt.interface';
import { AuthUser } from './../../decorators/auth-user.decorator';
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
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';

import { EventMessageDto } from './event-message.dto';
import { EventMessage } from './event-message.entity';
import { EventMessageService } from './event-message.service';

@UseGuards(AuthGuard(), RoleGuard)
@Crud({
    model: {
        type: EventMessage,
    },
    routes: {
        only: ['getManyBase', 'deleteOneBase'],
        getManyBase: { decorators: [Roles('member')] },
        deleteOneBase: { decorators: [Roles('market-lead')] },
    },
    query: {
        join: {
            event: {
                allow: ['start', 'daypart', 'teamId'],
            },
            user: {
                allow: ['firstName', 'lastName'],
            },
        },
    },
})
@Controller('event-message')
export class EventMessageController implements CrudController<EventMessage> {
    constructor(public service: EventMessageService) {}

    @Post()
    @UsePipes(ValidationPipe)
    createOne(@AuthUser() user: IUserJwt, @Body() message: EventMessageDto) {
        return this.service.addMessage(user, message);
    }
}
