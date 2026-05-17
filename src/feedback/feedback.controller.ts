import { IUserJwt } from './../user/interfaces/user-jwt.interface';
import { Roles } from './../decorators/role.decorator';
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Crud, CrudController, CrudAuth } from '@nestjsx/crud';
import { Feedback } from './feedback.entity';
import { FeedbackService } from './feedback.service';

@UseGuards(AuthGuard())
@Crud({
    model: {
        type: Feedback,
    },
    routes: {
        only: ['getManyBase', 'createOneBase', 'deleteOneBase'],
        getManyBase: {
            decorators: [Roles('market-lead', 'planner')],
        },
        deleteOneBase: { decorators: [Roles('market-lead')] },
        createOneBase: { decorators: [Roles('market-lead')] },
    },
    query: {
        join: {
            user: {
                eager: true,
                allow: ['firstName', 'lastName', 'lastNamePrefix', 'teamId'],
            },
            event: {},
        },
    },
})
@CrudAuth({
    property: 'user',
    persist: (user: IUserJwt) => ({
        userId: user.id,
    }),
})
@Controller('feedback')
export class FeedbackController implements CrudController<Feedback> {
    constructor(public service: FeedbackService) {}
}
