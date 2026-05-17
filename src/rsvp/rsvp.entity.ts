import { CrudValidationGroups } from '@nestjsx/crud';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CalendarEvent } from '../event/event.entity';
import { User } from '../user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../shared/entity-base';
import { RsvpResponse } from './enums/rsvp-response.enum';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity()
export class Rsvp extends BaseEntity {
    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @Column({ type: 'enum', enum: RsvpResponse, default: RsvpResponse.UNKNOWN })
    response: RsvpResponse;

    @Column({ nullable: false })
    eventId: number;

    @Column({ nullable: false })
    userId: number;

    @Column({ type: 'enum', enum: RsvpResponse, default: RsvpResponse.UNKNOWN })
    attended: RsvpResponse;

    @Column({ default: false })
    overlappingShift: boolean;

    /* Relations */

    @ManyToOne((type) => User, (user) => user.rsvps, { onDelete: 'CASCADE' })
    user?: User;

    @ManyToOne((type) => CalendarEvent, (event) => event.rsvps, {
        onDelete: 'CASCADE',
    })
    event?: CalendarEvent;
}
