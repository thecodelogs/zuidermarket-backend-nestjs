import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { subDays } from 'date-fns';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { IUserJwt } from '../user/interfaces/user-jwt.interface';
import { UserService } from '../user/user.service';
import { CalendarEvent } from './event.entity';

@Injectable()
export class EventService extends TypeOrmCrudService<CalendarEvent> {
    constructor(
        @InjectRepository(CalendarEvent) repo,
        private userService: UserService,
    ) {
        super(repo);
    }

    getMyTeamEvents(user: IUserJwt): Observable<CalendarEvent[]> {
        const now = new Date();
        const start = subDays(now, 1);
        return this.userService.getTeamId(user).pipe(
            switchMap((id) =>
                id
                    ? this.repo.find({
                          where: {
                              teamId: id,
                              start: MoreThanOrEqual(start),
                          },
                          relations: ['team', 'rsvps'],
                          order: { start: 'ASC' },
                      })
                    : of([]),
            ),
        );
    }

    getMyTeamsPastEvents(user: IUserJwt): Observable<CalendarEvent[]> {
        const now = new Date();
        return this.userService.getTeamId(user).pipe(
            switchMap((id) =>
                id
                    ? this.repo.find({
                          where: {
                              teamId: id,
                              start: LessThanOrEqual(now),
                          },
                          relations: [
                              'team',
                              'rsvps',
                              'rsvps.user',
                              'rsvps.event',
                              'feedback',
                              'feedback.user',
                          ],
                          order: { start: 'DESC' },
                      })
                    : of([]),
            ),
        );
    }

    getMyTeamsFutureEvents(user: IUserJwt): Observable<CalendarEvent[]> {
        const now = new Date();
        return this.userService.getTeamId(user).pipe(
            switchMap((id) =>
                id
                    ? this.repo.find({
                          where: {
                              teamId: id,
                              start: MoreThanOrEqual(now),
                          },
                          relations: [
                              'team',
                              'rsvps',
                              'rsvps.user',
                              'rsvps.event',
                              'feedback',
                              'feedback.user',
                          ],
                          order: { start: 'DESC' },
                      })
                    : of([]),
            ),
        );
    }

    findBetweenDates(start: Date, end: Date): Promise<CalendarEvent[]> {
        return this.repo.find({
            where: {
                start: Between(start, end),
            },
        });
    }

    findNextForTeam(teamId: number): Promise<CalendarEvent> {
        return this.repo.findOne({
            where: {
                start: MoreThanOrEqual(new Date()),
                teamId: teamId,
            },
        });
    }
}
