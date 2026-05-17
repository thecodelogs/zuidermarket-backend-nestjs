import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { endOfYear, startOfYear } from 'date-fns';
import { forkJoin, from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { IUserJwt } from 'src/user/interfaces/user-jwt.interface';
import { UserService } from 'src/user/user.service';
import { SubmitRegistrationsDto } from './dto/submit-registrations.dto';
import { EventRegistration } from './event-registration.entity';

@Injectable()
export class EventRegistrationService extends TypeOrmCrudService<EventRegistration> {
    logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(EventRegistration) repo,
        private userService: UserService,
    ) {
        super(repo);
    }

    getMyRegistrations(
        user: IUserJwt,
        year: string,
    ): Observable<EventRegistration[]> {
        return this.getTeamId(user).pipe(
            switchMap((teamId) => this.getRegistrationsForTeam(teamId, year)),
        );
    }

    getRegistrationsForTeam(teamId: number, year: string) {
        const { yearStart, yearEnd } = this.getTimeRange(year);
        return from(
            this.repo.find({ relations: ['event'], where: { teamId } }),
        ).pipe(
            map((registrations) =>
                registrations.filter(
                    (e) =>
                        e.event.start >= yearStart && e.event.start <= yearEnd,
                ),
            ),
        );
    }

    private getTimeRange(year: string) {
        const date = new Date(year);
        const yearStart = startOfYear(date);
        const yearEnd = endOfYear(date);
        return { yearStart, yearEnd };
    }

    private getTeamId(user: IUserJwt): Observable<number> {
        return this.userService.getProfile(user).pipe(
            map((profile) => profile.teamId),
            tap((id) => {
                if (!id) {
                    throw new Error('User has no team');
                }
            }),
        );
    }

    submitRegistrations(
        user: IUserJwt,
        dto: SubmitRegistrationsDto,
    ): Observable<EventRegistration[]> {
        this.logger.debug(
            `Saving ${dto.eventIds.length} event registrations for ${user.email} for year ${dto.year}`,
        );
        return this.getMyRegistrations(user, dto.year).pipe(
            tap((existing) =>
                this.logger.debug(
                    `Removing ${existing.length} existing registrations`,
                ),
            ),
            switchMap((registrations) => this.repo.remove(registrations)),
            switchMap(() =>
                this.getTeamId(user).pipe(
                    switchMap((teamId) =>
                        forkJoin(
                            dto.eventIds.map((eventId, index) =>
                                this.submitRegistration(
                                    eventId,
                                    teamId,
                                    index + 1,
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        );
    }

    private submitRegistration(
        eventId: number,
        teamId: number,
        priority: number,
    ): Observable<EventRegistration> {
        const eventRegistration = new EventRegistration();
        eventRegistration.eventId = eventId;
        eventRegistration.priority = priority;
        eventRegistration.teamId = teamId;
        return from(this.repo.save(eventRegistration));
    }
}
