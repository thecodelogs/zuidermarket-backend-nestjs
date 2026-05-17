import { Column, Entity, ManyToOne } from 'typeorm';
import { MessageEntityBase } from '../message-entity-base';
import { CalendarEvent } from './../../event/event.entity';
import { User } from './../../user/user.entity';
import { EventMessageRecipientGroup } from './event-message-recipient-group.enum';

@Entity()
export class EventMessage extends MessageEntityBase {
    @Column({ nullable: true })
    eventId: number;

    @Column({
        type: 'enum',
        enum: EventMessageRecipientGroup,
        default: EventMessageRecipientGroup.Nobody,
        nullable: true,
    })
    recipientGroup: EventMessageRecipientGroup;

    /* Relations */

    @ManyToOne((type) => User, (user) => user.sentEventMessages, {
        onDelete: 'SET NULL',
    })
    sentByUser?: User;

    @ManyToOne((type) => CalendarEvent, (event) => event.messages, {
        onDelete: 'SET NULL',
    })
    event?: CalendarEvent;
}
