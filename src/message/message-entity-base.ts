import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseEntity } from 'src/shared/entity-base';
import { Column } from 'typeorm';

export abstract class MessageEntityBase extends BaseEntity {
    @IsOptional({ always: true })
    @Column({ nullable: true })
    subject: string;

    @IsNotEmpty({ always: true })
    @Column({ type: 'longtext', nullable: false })
    body: string;

    @Column({ nullable: true })
    sentByUserId: number;
}
