import { User } from '../user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../shared/entity-base';

@Entity()
export class Notification extends BaseEntity {
    @Column({ length: 255 })
    title: string;

    @Column({ length: 255 })
    body: string;

    @Column({ type: 'text' })
    link: string;

    @Column({ nullable: true })
    scheduledFor: Date;

    @Column({ nullable: false })
    recipientId: number;

    @ManyToOne((type) => User, (user) => user.notifications, {
        onDelete: 'CASCADE',
    })
    recipient: User;
}
