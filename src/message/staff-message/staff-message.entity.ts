import { UserRole } from './../../user/types/user-role.type';
import { IsArray } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MessageEntityBase } from '../message-entity-base';
import { User } from './../../user/user.entity';

@Entity()
export class StaffMessage extends MessageEntityBase {
    @IsArray({ always: true })
    @Column('simple-array')
    recipientGroups: UserRole[];

    /* Relations */

    @ManyToOne((type) => User, (user) => user.sentStaffMessages, {
        onDelete: 'SET NULL',
    })
    sentByUser?: User;
}
