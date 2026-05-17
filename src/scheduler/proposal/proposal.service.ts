import { Injectable, Logger } from '@nestjs/common';
import { CalendarEvent } from '../../event/event.entity';
import { Team } from '../../team/team.entity';

@Injectable()
export class ProposalService {
    logger: Logger = new Logger(this.constructor.name);

    generateScheduleProposals(
        events: CalendarEvent[],
        teams: Team[],
    ): CalendarEvent[] {
        this.logger.log(
            `Dividing ${events.length} events over ${teams.length} teams`,
        );
        this.sortRegistrations(teams);
        this.shuffleArray(events);

        const numberOfEventsPerTeam = this.getNumberOfEventsPerTeam(
            events,
            teams,
        );

        for (let i = 0; i < numberOfEventsPerTeam; i++) {
            for (const team of teams) {
                if (this.hasReachedMax(team, numberOfEventsPerTeam)) {
                    continue;
                }

                if (!team.eventRegistrations[i]) {
                    continue;
                }

                for (const registration of team.eventRegistrations) {
                    const event = registration.event;
                    if (this.isConflict(event, team)) {
                        continue;
                    }
                    this.assignEventToTeam(event, team);
                    break;
                }
            }
        }

        const remainingEvents = events.filter((e) => !e.team);
        for (const event of remainingEvents) {
            for (const team of teams) {
                if (
                    this.hasReachedMax(team, numberOfEventsPerTeam) ||
                    this.isConflict(event, team)
                ) {
                    continue;
                }
                this.assignEventToTeam(event, team);
                break;
            }
        }

        const stillRemainingEvents = events.filter((e) => !e.team);
        for (const event of stillRemainingEvents) {
            teams.sort((a, b) => a.events.length - b.events.length);
            for (const team of teams) {
                if (this.isConflict(event, team)) {
                    continue;
                }
                this.assignEventToTeam(event, team);
                break;
            }
        }

        teams.forEach((team) => {
            delete team.events;
            delete team.eventRegistrations;
        });

        events.sort((a, b) => a.start.getTime() - b.start.getTime());

        return events;
    }

    private assignEventToTeam(event: CalendarEvent, team: Team) {
        event.team = team;
        team.events.push(event);
    }

    private hasReachedMax(team: Team, numberOfRounds: number) {
        return team.events.length >= numberOfRounds;
    }

    private isConflict(event: CalendarEvent, team: Team): boolean {
        if (event.team) {
            return true;
        }
        if (this.teamHasEventOnSameDay(team, event)) {
            return true;
        }
        return false;
    }

    private teamHasEventOnSameDay(team: Team, event: CalendarEvent) {
        return (
            team.events.findIndex(
                (e) => e.start.toISOString() === event.start.toISOString(),
            ) > -1
        );
    }

    private getNumberOfEventsPerTeam(
        events: CalendarEvent[],
        teams: Team[],
    ): number {
        return Math.round(events.filter((e) => !e.team).length / teams.length);
    }

    private sortRegistrations(teams: Team[]) {
        teams.forEach((team) => {
            team.eventRegistrations.sort((a, b) => a.priority - b.priority);
        });
    }

    private shuffleArray(array: any[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
