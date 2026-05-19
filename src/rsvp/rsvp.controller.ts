import {
    Controller,
    UseGuards,
    Post,
    Body,
    ValidationPipe,
    UsePipes,
    Get,
    Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Crud, CrudController } from '@nestjsx/crud';
import { Rsvp } from './rsvp.entity';
import { RsvpService } from './rsvp.service';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { IUserJwt } from '../user/interfaces/user-jwt.interface';
import { AuthUser } from '../decorators/auth-user.decorator';
import { CreateOwnRsvpDto } from './dto/create-own-rsvp.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard(), RoleGuard)
@Crud({
    model: {
        type: Rsvp,
    },
    routes: {
        createOneBase: { decorators: [Roles('admin', 'market-lead')] },
        createManyBase: { decorators: [Roles('admin', 'market-lead')] },
        getManyBase: { decorators: [Roles('member')] },
        getOneBase: { decorators: [Roles('member')] },
        updateOneBase: { decorators: [Roles('admin', 'market-lead')] },
        deleteOneBase: { decorators: [Roles('admin', 'market-lead')] },
    },
    query: {
        join: {
            event: {
                allow: ['start', 'daypart', 'teamId'],
            },
            'event.team': {},
            'event.rsvps': {},
            user: {
                eager: true,
                allow: ['firstName', 'lastName', 'lastNamePrefix', 'teamId'],
            },
        },
    },
})
@ApiBearerAuth()
@Controller('rsvp')
export class RsvpController implements CrudController<Rsvp> {
    constructor(public service: RsvpService) {}

    @UsePipes(
        new ValidationPipe({
            whitelist: true,
        }),
    )
    @Post('me')
    submitRsvp(@AuthUser() user: IUserJwt, @Body() rsvp: CreateOwnRsvpDto) {
        return this.service.submitRsvp(user, rsvp);
    }

    /**
     * Gets rsvp score of a given (user) ID from the backend.
     * @param id ID of the user to find the score
     * @returns Promise to find the score, as a number, for the given user ID, or void
     */
    @Get('score/:id')
    getRsvpScore(@Param('id') id: number) {
        return this.service.getRsvpScore(id);
    }

    /**
     * Updates absent status for given IDs.
     * @param body IDs and absent status
     * @returns Promise of updating status in batch
     */
    @Post('updateAbsent')
    updateAbsent(@Body() body: { ids: number[]; absent: boolean }) {
        return this.service.updateAbsentStatusBatch(body.ids, body.absent);
    }
}
