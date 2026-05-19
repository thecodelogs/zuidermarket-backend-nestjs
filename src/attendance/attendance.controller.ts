import { Controller, UseGuards, Get } from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { IUserJwt } from 'src/user/interfaces/user-jwt.interface';
import { AttendanceService } from './attendance.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard(), RoleGuard)
@Roles('market-lead')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
    constructor(private service: AttendanceService) {}

    @Get('rsvps')
    getRsvpsToBeChecked(@AuthUser() user: IUserJwt) {
        return this.service.getRsvpsToBeChecked(user);
    }

    @Get('done')
    getCheckedRsvps(@AuthUser() user: IUserJwt) {
        return this.service.getCheckedRsvps(user);
    }
}
