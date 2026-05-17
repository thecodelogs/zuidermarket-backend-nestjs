import { CrudValidationGroups } from '@nestjsx/crud';
import {
    IsBoolean,
    IsISO8601,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { User } from '../user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../shared/entity-base';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity()
export class Todo extends BaseEntity {
    @IsNotEmpty({ always: true })
    @IsString({ always: true })
    @MaxLength(255, { always: true })
    @Column({ length: 255 })
    body: string;

    @IsOptional({ always: true })
    @IsBoolean({ always: true })
    @Column({ nullable: true, default: false })
    completed: boolean;

    @IsOptional({ always: true })
    @IsISO8601()
    @Column({ nullable: true })
    deadline: Date;

    @IsOptional({ always: true })
    @IsNumber()
    @Column({ nullable: true })
    priority: number;

    @Column({ nullable: true })
    assigneeId?: number;

    @ManyToOne((type) => User, (user) => user.todos, { onDelete: 'CASCADE' })
    assignee: User;
}
