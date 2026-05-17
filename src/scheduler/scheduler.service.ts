import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfYear, eachDayOfInterval, isSaturday } from 'date-fns';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CalendarEvent } from 'src/event/event.entity';
import { Team } from 'src/team/team.entity';
import { MoreThanOrEqual, Repository, IsNull, Between } from 'typeorm';
import { ProposalService } from './proposal/proposal.service';
import { Daypart } from 'src/event/enums/daypart.enum';

@Injectable()
export class SchedulerService {
    logger = new Logger(this.constructor.name);
    teamRepo: Repository<Team>;
    eventRepo: Repository<CalendarEvent>;
    constructor(
        @InjectRepository(Team) teamRepo,
        @InjectRepository(CalendarEvent) eventRepo,
        private proposalService: ProposalService,
    ) {
        this.teamRepo = teamRepo;
        this.eventRepo = eventRepo;
    }

    getProposal(year: number): Observable<CalendarEvent[]> {
        return this.getEmptySlots(year).pipe(
            switchMap((events) =>
                this.getTeams().pipe(
                    map((teams) =>
                        this.proposalService.generateScheduleProposals(
                            events,
                            teams,
                        ),
                    ),
                ),
            ),
        );
    }

    saveSchedule(events: CalendarEvent[]): Observable<any> {
        this.logger.log(`Saving ${events.length} events...`);
        return forkJoin(events.map((event) => this.eventRepo.save(event)));
    }

    generateSaturdaySlots(year: number): Observable<any> {
        this.logger.log(`Generating event slots for ${year}...`);
        const start = new Date(year, 0);
        const end = endOfYear(start);
        return from(
            this.eventRepo.find({
                where: { start: Between(start, end) },
            }),
        ).pipe(
            switchMap((existingSlots) => {
                const eventMap = new Map(
                    existingSlots.map((e) => [e.start + e.daypart, e]),
                );
                const slots: CalendarEvent[] = eachDayOfInterval({
                    start,
                    end,
                })
                    .filter((date) => isSaturday(date))
                    .map((date) => this.createMorningAndAfternoonSlot(date))
                    .flat()
                    .filter((event) => !this.slotExists(event, eventMap));
                this.logger.debug(`${slots.length} slots to be created`);
                if (slots.length === 0) {
                    return of({ result: '0 created' });
                } else {
                    return from(this.eventRepo.save(slots)).pipe(
                        map((res) => ({ result: `${res.length} created` })),
                    );
                }
            }),
        );
    }

    private slotExists(
        event: CalendarEvent,
        eventMap: Map<string, CalendarEvent>,
    ): boolean {
        return eventMap.has(event.start + event.daypart);
    }

    private createMorningAndAfternoonSlot(date: Date) {
        const morningEvent = new CalendarEvent();
        const afternoonEvent = new CalendarEvent();
        morningEvent.daypart = Daypart.MORNING;
        morningEvent.start = date;
        afternoonEvent.daypart = Daypart.AFTERNOON;
        afternoonEvent.start = date;
        return [morningEvent, afternoonEvent];
    }

    private getTeams(): Observable<Team[]> {
        return from(
            this.teamRepo.find({
                relations: [
                    'eventRegistrations',
                    'eventRegistrations.event',
                    'events',
                ],
            }),
        );
    }

    private getEmptySlots(year: number): Observable<CalendarEvent[]> {
        const start = new Date(year, 0);
        const end = endOfYear(start);
        return from(
            this.eventRepo.find({
                where: {
                    start: Between(start, end),
                    isActive: true,
                    teamId: IsNull(),
                },
                relations: ['team'],
            }),
        );
    }
}
