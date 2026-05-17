import { CrudValidationGroups } from '@nestjsx/crud';
import { IsNumber, IsOptional } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CalendarEvent } from '../event/event.entity';
import { BaseEntity } from '../shared/entity-base';
import { Team } from '../team/team.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity()
export class EventRegistration extends BaseEntity {
    @Column({ nullable: false, default: 1 })
    @IsNumber({}, { always: true })
    @IsOptional({ always: true })
    priority: number;

    @Column({ nullable: true })
    teamId?: number;

    @Column({ nullable: false })
    eventId: number;

    @ManyToOne((type) => Team, (team) => team.eventRegistrations, {
        onDelete: 'CASCADE',
    })
    team: Team;

    @ManyToOne((type) => CalendarEvent, (event) => event.registrations, {
        onDelete: 'CASCADE',
    })
    event?: CalendarEvent;
}
