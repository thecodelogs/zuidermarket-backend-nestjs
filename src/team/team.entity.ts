import { ApiProperty } from '@nestjs/swagger';
import { CrudValidationGroups } from '@nestjsx/crud';
import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { CalendarEvent } from '../event/event.entity';
import { User } from '../user/user.entity';
import { AfterLoad, Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../shared/entity-base';
import { differenceInYears } from 'date-fns';
import { EventRegistration } from '../event-registration/event-registration.entity';
import { Gender } from 'src/user/enums/gender.enum';
import { CarryingCapacity } from 'src/user/enums/carrying-capacity.enum';
import { EmploymentStatus } from 'src/user/enums/employment-status.enum';

const { UPDATE } = CrudValidationGroups;

@Unique(['name'])
@Entity()
export class Team extends BaseEntity {
    @ApiProperty()
    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ always: true })
    @IsString({ always: true })
    @MaxLength(191, { always: true })
    @Column({ length: 191 })
    name: string;

    @IsOptional({ always: true })
    @IsBoolean({ always: true })
    @Column({ type: 'boolean', default: true })
    hasMarketDuty: boolean;

    @OneToMany((type) => User, (user) => user.team)
    users: User[];

    @OneToMany((type) => CalendarEvent, (event) => event.team)
    events: CalendarEvent[];

    @OneToMany(
        (type) => EventRegistration,
        (eventRegistration) => eventRegistration.team,
    )
    eventRegistrations: EventRegistration[];

    @IsBoolean({ always: true })
    @Column({ type: 'boolean', default: false })
    test: boolean;

    /* Calculated meta fields */
    health?: any;
    memberCount?: number;
    activeMemberCount?: number;
    inactiveMemberCount?: number;
    maleFemaleRatio?: string;
    meanAge?: number;

    @AfterLoad()
    setMemberCount?() {
        this.memberCount = (this.users && this.users.length) || 0;
        this.activeMemberCount = this.users?.filter(
            (u) =>
                u.hasMarketDuty &&
                u.employmentStatus === EmploymentStatus.ACTIVE,
        ).length;
        this.inactiveMemberCount = this.memberCount - this.activeMemberCount;
    }

    @AfterLoad()
    setHealth?(): void {
        const users = this.users;
        if (!users?.length) {
            return;
        }
        this.health = {
            meanCarryingCapacity: this.getMeanCarryingCapacity(users),
            ageDiversityScore: this.getAgeScore(users),
            genderDiversityScore: this.getGenderScore(users),
            peopleCountScore: this.getPeopleCountScore(users),
        };
    }

    @AfterLoad()
    setMaleFemaleRatio?(): void {
        const users = this.users || [];
        this.maleFemaleRatio = `${this.getGenderCount(
            users,
            Gender.MALE,
        )}:${this.getGenderCount(users, Gender.FEMALE)}`;
    }

    @AfterLoad()
    setMeanAge?(): void {
        const users = this.users || [];
        if (!users.length) {
            return;
        }
        const now = new Date();
        const totalAge = users
            .filter((user) => user.dateOfBirth)
            .reduce((total, user) => {
                const age = differenceInYears(now, user.dateOfBirth);
                return total + age;
            }, 0);
        this.meanAge = Math.round(totalAge / users.length);
    }

    private getAgeScore?(users: User[]): number {
        const now = new Date();
        if (users === undefined || users === null || users.length === 0) {
            return 0;
        }
        let numberOfOld = 0;
        let numberOfYoung = 0;
        for (const user of users) {
            if (user.dateOfBirth) {
                const age = differenceInYears(now, user.dateOfBirth);
                if (age >= 50) {
                    numberOfOld++;
                }
                if (age < 50) {
                    numberOfYoung++;
                }
            }
        }
        if (numberOfOld === numberOfYoung) {
            return 1;
        }
        if (numberOfOld === 0 || numberOfYoung === 0) {
            return 0;
        }
        if (numberOfYoung - numberOfOld < 0) {
            return numberOfYoung / numberOfOld;
        }
        if (numberOfYoung - numberOfOld > 0) {
            return numberOfOld / numberOfYoung;
        }
        return 0;
    }

    private getGenderCount?(users: User[] = [], gender: Gender): number {
        return users.filter((user) => user.gender === gender).length;
    }

    private getMeanCarryingCapacity?(users: User[]): CarryingCapacity {
        const numericalValues = {
            [CarryingCapacity.LOW]: 0,
            [CarryingCapacity.MEDIUM]: 1,
            [CarryingCapacity.HIGH]: 2,
        };
        const meanValue =
            users
                .map((user) => {
                    return numericalValues[user.carryingCapacity];
                })
                .reduce((total, value) => total + value, 0) / users.length;
        return [
            CarryingCapacity.LOW,
            CarryingCapacity.MEDIUM,
            CarryingCapacity.HIGH,
        ][Math.round(meanValue)];
    }

    private getPeopleCountScore?(users: User[]): number {
        if (users === undefined || users === null) {
            return 0;
        }
        if (users.length === 12) {
            return 1;
        }
        if (users.length <= 6 || users.length >= 18) {
            return 0;
        }
        if (users.length > 12) {
            return 1 - 0.1 * (users.length - 12);
        }
        if (users.length < 12) {
            return 1 - 0.1 * (12 - users.length);
        }
    }

    private getGenderScore?(users: User[]): number {
        if (users === undefined || users === null || users.length === 0) {
            return 0;
        }
        let numberOfFemales = 0;
        let numberOfMales = 0;
        for (const user of users) {
            if (user.gender === Gender.FEMALE) {
                numberOfFemales++;
            }
            if (user.gender === Gender.MALE) {
                numberOfMales++;
            }
        }
        if (numberOfFemales - numberOfMales === 0) {
            return 1;
        }
        if (
            numberOfFemales === users.length ||
            numberOfMales === users.length
        ) {
            return 0;
        }
        if (numberOfFemales - numberOfMales < 0) {
            return numberOfFemales / numberOfMales;
        }
        if (numberOfFemales - numberOfMales > 0) {
            return numberOfMales / numberOfFemales;
        }
        return 0;
    }
}
