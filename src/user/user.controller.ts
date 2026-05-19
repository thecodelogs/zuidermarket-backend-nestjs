import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Patch,
    SerializeOptions,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthUser } from '../decorators/auth-user.decorator';
import { Roles } from '../decorators/role.decorator';
import { UpdateOwnUserDto } from './dto/update-own-user.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { ViewOwnUserDto } from './dto/view-own-user.dto';
import { IUserJwt } from './interfaces/user-jwt.interface';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard(), RoleGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(public service: UserService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @SerializeOptions({ strategy: 'excludeAll' })
    @Get('me')
    getMyProfile(@AuthUser() user: IUserJwt): Observable<ViewOwnUserDto> {
        return this.service
            .getProfile(user)
            .pipe(map((res) => new ViewOwnUserDto(res)));
    }

    @UsePipes(
        new ValidationPipe({
            whitelist: true,
        }),
    )
    @Patch('me')
    updateMyProfile(@AuthUser() user: IUserJwt, @Body() dto: UpdateOwnUserDto) {
        return this.service.updateProfile(user, dto);
    }

    @Roles('market-lead', 'market-lead-assistant')
    @Patch('team-member/:id')
    updateEmploymentStatus(
        @AuthUser() user: IUserJwt,
        @Param('id') userId: number,
        @Body() dto: UpdateTeamMemberDto,
    ) {
        return this.service.updateTeamMember(user, userId, dto);
    }

    @Get('my-team')
    getMyTeam(@AuthUser() user: IUserJwt) {
        return this.service.getMyTeam(user);
    }
}
