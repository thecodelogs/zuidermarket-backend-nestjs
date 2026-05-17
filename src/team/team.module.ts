import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { Team } from './team.entity';
import { TeamService } from './team.service';
import { TeamAdminController } from './team-admin/team-admin.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Team]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [TeamController, TeamAdminController],
    providers: [TeamService],
    exports: [TeamService],
})
export class TeamModule {}
