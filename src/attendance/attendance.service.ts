import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventService } from 'src/event/event.service';
import { RsvpResponse } from 'src/rsvp/enums/rsvp-response.enum';
import { Rsvp } from 'src/rsvp/rsvp.entity';
import { IUserJwt } from 'src/user/interfaces/user-jwt.interface';
import { CalendarEvent } from 'src/event/event.entity';

interface IPastRsvp {
    user: {
        fullName: string;
    };
    response: RsvpResponse;
    attended: RsvpResponse;
    event: CalendarEvent;
    overlappingShift: boolean;
    id: number;
    createdAt: Date;
    updatedAt: Date;
}
@Injectable()
export class AttendanceService {
    logger = new Logger(this.constructor.name);

    constructor(private eventService: EventService) {}

    getRsvpsToBeChecked(user: IUserJwt): Observable<any[]> {
        return this.getPastTeamRsvps(user).pipe(
            map((rsvps) => rsvps.filter((rsvp) => this.shouldBeChecked(rsvp))),
        );
    }

    getCheckedRsvps(user: IUserJwt): Observable<any[]> {
        return this.getPastTeamRsvps(user).pipe(
            map((rsvps) => rsvps.filter((rsvp) => this.hasRespondedYes(rsvp))),
        );
    }

    private getPastTeamRsvps(user: IUserJwt): Observable<IPastRsvp[]> {
        return this.eventService.getMyTeamsPastEvents(user).pipe(
            map((events) =>
                events
                    .map((e) => e.rsvps)
                    .flat()
                    .map((rsvp) => {
                        return {
                            user: {
                                fullName: rsvp.user.fullName,
                            },
                            response: rsvp.response,
                            attended: rsvp.attended,
                            event: rsvp.event,
                            overlappingShift: rsvp.overlappingShift,
                            id: rsvp.id,
                            createdAt: rsvp.createdAt,
                            updatedAt: rsvp.updatedAt,
                        };
                    }),
            ),
        );
    }

    private shouldBeChecked(rsvp: IPastRsvp): boolean {
        return this.isNew(rsvp) && this.hasRespondedYes(rsvp);
    }

    private hasRespondedYes(rsvp: IPastRsvp): boolean {
        return (
            rsvp.response === RsvpResponse.YES && !!rsvp.user && !!rsvp.event
        );
    }

    private isNew(rsvp: IPastRsvp): boolean {
        return rsvp.attended === RsvpResponse.UNKNOWN;
    }
}
