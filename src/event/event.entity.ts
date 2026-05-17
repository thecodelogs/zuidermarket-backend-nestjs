import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CrudValidationGroups } from '@nestjsx/crud';
import {
    IsBoolean,
    IsISO8601,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { Feedback } from '../feedback/feedback.entity';
import { Rsvp } from '../rsvp/rsvp.entity';
import { Team } from '../team/team.entity';
import { Column, Entity, ManyToOne, OneToMany, AfterLoad } from 'typeorm';
import { BaseEntity } from '../shared/entity-base';
import { EventRegistration } from '../event-registration/event-registration.entity';
import { Daypart } from './enums/daypart.enum';
import { RsvpResponse } from 'src/rsvp/enums/rsvp-response.enum';
import { User } from 'src/user/user.entity';
import { EventMessage } from 'src/message/event-message/event-message.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({ name: 'event' })
export class CalendarEvent extends BaseEntity {
    @ApiProperty()
    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsISO8601()
    @Column({ nullable: false })
    start: Date;

    @ApiProperty()
    @IsNotEmpty({ groups: [CREATE] })
    @Column({
        type: 'enum',
        enum: Daypart,
        default: Daypart.MORNING,
        nullable: false,
    })
    daypart: Daypart;

    @ApiPropertyOptional()
    @IsOptional({ always: true })
    @IsBoolean({ always: true })
    @Column({ nullable: true })
    isHoliday: boolean;

    @ApiProperty()
    @IsOptional({ always: true })
    @IsBoolean({ always: true })
    @Column({ nullable: false, default: true })
    isActive: boolean;

    @ApiPropertyOptional()
    @IsOptional({ always: true })
    @IsString({ always: true })
    @Column({ nullable: true })
    note: string;

    @Column({ nullable: true })
    teamId?: number;

    /* Relations */

    @ManyToOne((type) => Team, (team) => team.events, { onDelete: 'SET NULL' })
    team: Team;

    @OneToMany((type) => Rsvp, (rsvp) => rsvp.event)
    rsvps: Rsvp[];

    @OneToMany(
        (type) => EventRegistration,
        (registration) => registration.event,
    )
    registrations: EventRegistration[];

    @OneToMany((type) => Feedback, (feedback) => feedback.event)
    feedback: Feedback[];

    @OneToMany((type) => EventMessage, (message) => message.event)
    messages: EventMessage[];

    /* Calculated meta fields */
    going?: number;
    notGoing?: number;
    notResponded: User[];

    @AfterLoad()
    getNumberOfGoing?() {
        this.going = this.rsvps?.filter(
            (r) => r.response === RsvpResponse.YES,
        ).length;
        this.notGoing = this.rsvps?.filter(
            (r) => r.response === RsvpResponse.NO,
        ).length;
        this.notResponded =
            this.rsvps &&
            this.team?.users
                ?.filter((user) => user.hasMarketDuty)
                .filter(
                    (user) =>
                        !this.rsvps.some((rsvp) => rsvp.userId === user.id),
                );
    }
}
