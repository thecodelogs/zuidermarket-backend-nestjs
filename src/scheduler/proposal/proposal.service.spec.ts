import { CalendarEvent } from '../../event/event.entity';
import { Team } from '../../team/team.entity';
import { ProposalService } from './proposal.service';
import * as faker from 'faker';
import { eachDayOfInterval, isSaturday } from 'date-fns';
import { Daypart } from '../../event/enums/daypart.enum';

describe('ProposalService', () => {
    let service: ProposalService;
    let testEvents: CalendarEvent[];
    let testTeams: Team[];
    let proposedSchedule: CalendarEvent[];

    beforeAll(() => {
        faker.seed(1);
        service = new ProposalService();
        testEvents = generateEvents(2021);
        testTeams = generateTeams(testEvents, 20);
    });

    beforeEach(async () => {
        proposedSchedule = service.generateScheduleProposals(
            testEvents,
            testTeams,
        );
    });

    describe('generateScheduleProposals', () => {
        it('should return array', () => {
            expect(Array.isArray(proposedSchedule)).toBe(true);
        });

        it('should leave no events without a team', () => {
            const withoutTeam = proposedSchedule.filter((e) => !e.team);
            expect(withoutTeam.length).toBe(0);
        });

        it('should distribute events evenly amongst the teams', () => {
            const eventsPerTeam = proposedSchedule
                .filter((e) => e.team)
                .reduce((teams, event) => {
                    const teamId = event.team.id;
                    if (teams[teamId]) {
                        teams[teamId]++;
                    } else {
                        teams[teamId] = 1;
                    }
                    return teams;
                }, {});
            const distribution = Object.keys(eventsPerTeam).reduce(
                (extremes, teamId) => {
                    const numberOfEvents = eventsPerTeam[teamId];
                    if (numberOfEvents > extremes.highest) {
                        extremes.highest = numberOfEvents;
                    }
                    if (
                        extremes.lowest === 0 ||
                        numberOfEvents < extremes.lowest
                    ) {
                        extremes.lowest = numberOfEvents;
                    }
                    return extremes;
                },
                { lowest: 0, highest: 0 },
            );
            expect(
                distribution.highest - distribution.lowest,
            ).toBeLessThanOrEqual(2);
        });

        it('should not assign two events to one team on the same day', () => {
            const duplicates = [];
            const sorted = proposedSchedule
                .filter((e) => e.team)
                .map((e) => ({ start: e.start.getTime(), teamId: e.team.id }))
                .sort((a, b) => a.start - b.start);
            for (let i = 0; i < sorted.length - 1; i++) {
                const next = sorted[i + 1];
                const cur = sorted[i];
                if (next.start === cur.start && next.teamId === cur.teamId) {
                    duplicates.push(sorted[i]);
                }
            }
            expect(duplicates.length).toBe(0);
        });
    });
});

function generateEvents(year: number): CalendarEvent[] {
    return eachDayOfInterval({
        start: new Date(`${year}-01-01`),
        end: new Date(`${year + 1}-01-01`),
    })
        .filter((d) => isSaturday(d))
        .map((sat) => ({
            id: null,
            createdAt: null,
            updatedAt: null,
            start: sat,
            daypart: null,
            isHoliday: false,
            isActive: false,
            note: null,
            teamId: null,
            team: null,
            rsvps: [],
            feedback: [],
            registrations: [],
        }))
        .map((e) => [
            { ...e, ...{ daypart: Daypart.MORNING } },
            { ...e, ...{ daypart: Daypart.AFTERNOON } },
        ])
        .flat()
        .map((e, index) => ({ ...e, ...{ id: index + 1 } }));
}

function generateTeams(
    testEvents: CalendarEvent[],
    numberOfTeams: number,
): Team[] {
    const teams = Array.from(new Array(numberOfTeams)).map((_, index) => {
        const id = index + 1;
        const availableEvents = testEvents.slice();
        return {
            id,
            createdAt: null,
            updatedAt: null,
            name: `Team ${faker.random.word()}`,
            eventRegistrations: Array.from(
                new Array(faker.random.number(15)),
                // tslint:disable-next-line: no-shadowed-variable
            ).map((_, regIndex) => {
                const chosenEvent = availableEvents.splice(
                    faker.random.number(availableEvents.length - 1),
                    1,
                )[0];

                return {
                    id: regIndex + 1,
                    priority: regIndex + 1,
                    teamId: id,
                    eventId: chosenEvent.id,
                    event: chosenEvent,
                    createdAt: faker.date.past(1, new Date()),
                    updatedAt: faker.date.past(1, new Date()),
                    team: null,
                };
            }),
            users: [],
            events: [],
        };
    });
    const allRegistrations = [];
    teams.forEach((team) => {
        team.eventRegistrations.forEach((registration) => {
            registration.team = team;
            allRegistrations.push(registration);
        });
    });

    testEvents.forEach((event) => {
        event.registrations = allRegistrations.filter(
            (reg) => reg.event === event,
        );
    });
    return teams;
}
