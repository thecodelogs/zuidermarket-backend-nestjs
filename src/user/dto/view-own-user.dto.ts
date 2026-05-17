import { Expose } from 'class-transformer';
import { CarryingCapacity } from '../enums/carrying-capacity.enum';
import { Gender } from '../enums/gender.enum';
import { Language } from '../enums/language.enum';
import { User } from '../user.entity';

export class ViewOwnUserDto {
    @Expose()
    firstName: string;
    @Expose()
    lastName: string;
    @Expose()
    lastNamePrefix: string;
    @Expose()
    fullName: string;

    @Expose()
    phone: string;
    @Expose()
    phoneSecondary: string;
    @Expose()
    language: Language;
    @Expose()
    gender: Gender;
    @Expose()
    dateOfBirth: Date;
    @Expose()
    carryingCapacity: CarryingCapacity;
    @Expose()
    prefersOverlappingShift: boolean;
    @Expose()
    address: string;
    @Expose()
    postcode: string;
    @Expose()
    city: string;
    @Expose()
    specialties: string;
    @Expose()
    disabilities: string;
    @Expose()
    noteByMember: string;
    @Expose()
    rsvpScore: number;
    @Expose()
    hasMarketDuty: boolean;

    @Expose()
    teamId: number;

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }
}
