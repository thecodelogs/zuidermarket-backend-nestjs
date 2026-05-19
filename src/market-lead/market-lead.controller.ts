import { ViewUserAsMarketLead } from './view-user-as-market-lead.dto';
import { UserService } from 'src/user/user.service';
import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    SerializeOptions,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard(), RoleGuard)
@Roles('market-lead', 'market-lead-assistant')
@ApiBearerAuth()
@Controller('market-lead')
export class MarketLeadController {
    constructor(private userService: UserService) {}

    @Get('user/:id')
    @UseInterceptors(ClassSerializerInterceptor)
    @SerializeOptions({ strategy: 'excludeAll' })
    getUser(@Param('id') id: number): Observable<ViewUserAsMarketLead> {
        return from(this.userService.findOne(id)).pipe(
            map((user) => new ViewUserAsMarketLead(user)),
        );
    }
}
