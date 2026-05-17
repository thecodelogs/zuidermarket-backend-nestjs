import { User } from './../user/user.entity';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CalendarEvent } from '../event/event.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../shared/entity-base';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity()
export class Feedback extends BaseEntity {
    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsString({ always: true })
    @Column({ type: 'longtext' })
    answers: string;

    @Column({ nullable: true })
    eventId?: number;

    @Column({ nullable: true })
    userId: number;

    /* relations */
    @ManyToOne((type) => CalendarEvent, (event) => event.feedback, {
        onDelete: 'CASCADE',
    })
    event: CalendarEvent;

    @ManyToOne((type) => User, (user) => user.feedback, {
        onDelete: 'SET NULL',
    })
    user: User;
}
