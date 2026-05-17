import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UpdateOwnUserDto } from './dto/update-own-user.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { IUserJwt } from './interfaces/user-jwt.interface';
import { UserRole } from './types/user-role.type';
import { User } from './user.entity';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
    logger = new Logger(this.constructor.name);
    constructor(@InjectRepository(User) repo) {
        super(repo);
    }

    findById(id: number) {
        return this.repo.findOne(id);
    }

    findByEmail(email: string): Promise<User> {
        return this.repo.findOne({
            where: { email },
            select: ['id', 'password', 'email', 'roles', 'hasPaidEntryFee'],
        });
    }

    findByRoles(roles: UserRole[]) {
        return from(this.repo.find()).pipe(
            map((allUsers) =>
                allUsers.filter((user) =>
                    roles.some((role) => user.roles.includes(role)),
                ),
            ),
        );
    }

    getProfile(user: IUserJwt): Observable<User> {
        return from(this.repo.findOneOrFail(user.id));
    }

    getTeamId(user: IUserJwt): Observable<number> {
        return this.getProfile(user).pipe(map((profile) => profile.teamId));
    }

    getMyTeam(user: IUserJwt): Observable<User[]> {
        return this.getTeamId(user).pipe(
            switchMap((teamId) =>
                teamId
                    ? this.repo.find({
                          where: {
                              teamId,
                          },
                      })
                    : of([]),
            ),
        );
    }

    updateProfile(user: IUserJwt, dto: UpdateOwnUserDto): Observable<any> {
        return this.getProfile(user).pipe(
            switchMap((match) => {
                this.logger.log(`Updating profile for ${user.email}...`);
                this.logger.debug(JSON.stringify(dto));
                const updatedUser = { ...match, ...dto };
                return this.repo.save(updatedUser);
            }),
        );
    }

    updateTeamMember(
        marketLead: IUserJwt,
        userId: number,
        dto: UpdateTeamMemberDto,
    ): Observable<any> {
        this.logger.log(
            `Market lead ${marketLead.id} is updating employment status for user ${userId}...`,
        );
        return this.getTeamId(marketLead).pipe(
            switchMap((marketLeadTeamId) =>
                from(this.repo.findOneOrFail(userId)).pipe(
                    switchMap((user) => {
                        if (user.teamId !== marketLeadTeamId) {
                            throw new UnauthorizedException();
                        }
                        user.employmentStatus = dto.status;
                        user.carryingCapacity = dto.carryingCapacity;
                        return this.repo.save(user);
                    }),
                ),
            ),
        );
    }

    /**
     * Saves changes to database for a given user.
     * @param user User object, the user to save the information of
     * @returns Promise, the saved user
     */
    async save(user: User) {
        // this.logger.log(`Saving new info for: ` + user.id + `paid entry is: ` + user.hasPaidEntryFee);
        return this.repo.save(user);
    }
}
