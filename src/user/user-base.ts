import { CrudValidationGroups } from '@nestjsx/crud';
import * as bcrypt from 'bcryptjs';
import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    MaxLength,
} from 'class-validator';
import { EventMessage } from 'src/message/event-message/event-message.entity';
import { StaffMessage } from 'src/message/staff-message/staff-message.entity';
import {
    BeforeInsert,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    Unique,
} from 'typeorm';
import { Notification } from '../notification/notification.entity';
import { Rsvp } from '../rsvp/rsvp.entity';
import { BaseEntity } from '../shared/entity-base';
import { Team } from '../team/team.entity';
import { Todo } from '../todo/todo.entity';
import { AuditLogLine } from './../audit-log/audit-log.entity';
import { Feedback } from './../feedback/feedback.entity';
import { UserRole } from './types/user-role.type';

const { CREATE, UPDATE } = CrudValidationGroups;

@Unique(['email'])
@Entity()
export class BaseUser extends BaseEntity {
    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsString({ always: true })
    @MaxLength(191, { always: true })
    @IsEmail({ require_tld: false }, { always: true })
    @Column({ length: 191 })
    email: string;

    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsString({ always: true })
    @Length(8, 255, { always: true })
    @Column({ length: 255, select: false })
    password: string;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    @IsOptional({ always: true })
    @IsBoolean({ always: true })
    @Column({ type: 'boolean', default: false })
    isActive: boolean;

    @Column({ nullable: true })
    teamId?: number;

    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsArray({ always: true })
    @Column('simple-array')
    roles: UserRole[];

    /* Relations */

    @ManyToOne((type) => Team, (team) => team.users, { onDelete: 'SET NULL' })
    team: Team;

    @OneToMany((type) => Rsvp, (rsvp) => rsvp.user)
    rsvps: Rsvp[];

    @OneToMany((type) => Todo, (todo) => todo.assignee)
    todos: Todo[];

    @OneToMany((type) => Notification, (notification) => notification.recipient)
    notifications: Notification[];

    @OneToMany(
        (type) => EventMessage,
        (sentEventMessage) => sentEventMessage.sentByUser,
    )
    sentEventMessages: EventMessage[];

    @OneToMany(
        (type) => StaffMessage,
        (sentStaffMessage) => sentStaffMessage.sentByUser,
    )
    sentStaffMessages: StaffMessage[];

    @OneToMany((type) => Feedback, (feedback) => feedback.user)
    feedback: Feedback[];

    @OneToMany((type) => AuditLogLine, (auditLogLine) => auditLogLine.user)
    auditLogLines: AuditLogLine[];
}
