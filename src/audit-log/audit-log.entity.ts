import { BaseEntity } from 'src/shared/entity-base';
import { User } from 'src/user/user.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

@Entity()
export class AuditLogLine extends BaseEntity {
    @Index()
    @Column()
    action: string;

    @Index()
    @Column()
    resource: string;

    @Column({ type: 'longtext' })
    body: string;

    @Index()
    @Column({ nullable: true })
    userId: number;

    @Index()
    @Column({ nullable: true })
    email: string;

    @Column('simple-array', { nullable: true })
    roles: string[];

    @ManyToOne((type) => User, (user) => user.auditLogLines, {
        onDelete: 'SET NULL',
    })
    user: User;
}
