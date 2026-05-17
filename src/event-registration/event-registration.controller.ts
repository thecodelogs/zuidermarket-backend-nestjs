import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { IUserJwt } from 'src/user/interfaces/user-jwt.interface';
import { SubmitRegistrationsDto } from './dto/submit-registrations.dto';
import { EventRegistrationService } from './event-registration.service';

@UseGuards(AuthGuard(), RoleGuard)
@Roles('market-lead')
@Controller('event-registration')
export class EventRegistrationController {
    constructor(private service: EventRegistrationService) {}

    @Post()
    submitRegistration(
        @AuthUser() user: IUserJwt,
        @Body() dto: SubmitRegistrationsDto,
    ) {
        return this.service.submitRegistrations(user, dto);
    }

    @Get('my-registrations')
    getMyRegistrations(@AuthUser() user: IUserJwt, @Query('year') year) {
        return this.service.getMyRegistrations(user, year);
    }

    @Get('team/:teamId')
    getTeamRegistrations(@Param('teamId') teamId, @Query('year') year) {
        return this.service.getRegistrationsForTeam(+teamId, year);
    }
}
