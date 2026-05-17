import { CrudValidationGroups } from '@nestjsx/crud';
import {
    IsBoolean,
    IsISO8601,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    IsEmail,
} from 'class-validator';
import { AfterLoad, Column, Entity, Index } from 'typeorm';
import { CarryingCapacity } from './enums/carrying-capacity.enum';
import { EmploymentStatus } from './enums/employment-status.enum';
import { Gender } from './enums/gender.enum';
import { Language } from './enums/language.enum';
import { BaseUser } from './user-base';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity()
export class User extends BaseUser {
    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsString({ always: true })
    @Column()
    firstName: string;

    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsString({ always: true })
    @Column()
    lastName: string;

    @IsOptional({ always: true })
    @Column({ nullable: true })
    lastNamePrefix: string;

    @IsOptional({ always: true })
    @IsString({ always: true })
    @MaxLength(20, { always: true })
    @Column({ nullable: true })
    phone: string;

    @IsOptional({ always: true })
    @IsString({ always: true })
    @MaxLength(20, { always: true })
    @Column({ nullable: true })
    phoneSecondary: string;

    @IsOptional({ always: true })
    @IsEmail({ require_tld: false })
    @Column({ nullable: true })
    emailSecondary: string;

    @IsOptional({ always: true })
    @IsString({ always: true })
    @Column({
        type: 'enum',
        enum: Language,
        default: Language.DUTCH,
    })
    language: Language;

    @IsOptional({ always: true })
    @IsString({ always: true })
    @Column({
        type: 'enum',
        enum: EmploymentStatus,
        default: EmploymentStatus.NEW,
    })
    employmentStatus: EmploymentStatus;

    @Index()
    @IsOptional({ always: true })
    @Column({ nullable: true })
    memberCardNumber: string;

    @Index()
    @IsOptional({ always: true })
    @IsNumber()
    @Column({ nullable: true })
    memberCardNumberSecondary: string;

    @IsOptional({ always: true })
    @IsISO8601()
    @Column({ nullable: true })
    dateOfBirth: Date;

    @IsOptional({ always: true })
    @IsString({ always: true })
    @Column({
        type: 'enum',
        enum: Gender,
        default: Gender.OTHER,
    })
    gender: Gender;

    @IsOptional({ always: true })
    @Column({
        nullable: true,
        type: 'enum',
        enum: CarryingCapacity,
        default: CarryingCapacity.MEDIUM,
    })
    carryingCapacity: CarryingCapacity;

    @IsOptional({ always: true })
    @IsBoolean()
    @Column({ default: false, nullable: true })
    prefersOverlappingShift: boolean;

    @Column({ nullable: true })
    address: string;

    @IsOptional({ always: true })
    @Column({ nullable: true })
    postcode: string;

    @IsOptional({ always: true })
    @Column({ nullable: true })
    city: string;

    @IsOptional({ always: true })
    @Column({ nullable: true })
    nationality: string;

    @IsOptional({ always: true })
    @Column({ nullable: true, type: 'text' })
    disabilities: string;

    @IsOptional({ always: true })
    @Column({ nullable: true, type: 'text' })
    specialties: string;

    @IsOptional({ always: true })
    @Column({ nullable: true, type: 'text' })
    noteByMember: string;

    @IsOptional({ always: true })
    @Column({ nullable: true, type: 'text' })
    noteByMarketLead: string;

    @IsOptional({ always: true })
    @Column({ nullable: false, default: true })
    hasMarketDuty: boolean;

    @IsOptional({ always: true })
    @Column({ nullable: false, default: false })
    hasPaidEntryFee: boolean;

    @IsOptional({ always: true })
    @Column({ nullable: true })
    paymentId: string;

    @IsOptional({ always: true })
    @Column({ nullable: false, default: false })
    emailOptout: boolean;

    @IsOptional({ always: true })
    @Column({ nullable: true })
    memberSince: Date;

    @IsOptional({ always: true })
    @Column({ nullable: true })
    memberUntil: Date;

    @Column({ default: 0 })
    rsvpScore: number;

    @Column({ default: false })
    absent: boolean;

    @Column({ default: null })
    absentSince: Date;

    /* calculated */

    fullName: string;

    @AfterLoad()
    getFullName() {
        this.fullName = [this.firstName, this.lastNamePrefix, this.lastName]
            .filter((x) => x)
            .join(' ');
    }
}
