import { Expose } from 'class-transformer';
import { CarryingCapacity } from 'src/user/enums/carrying-capacity.enum';
import { Language } from 'src/user/enums/language.enum';
import { User } from 'src/user/user.entity';

export class ViewUserAsMarketLead {
    @Expose()
    firstName: string;
    @Expose()
    lastName: string;
    @Expose()
    lastNamePrefix: string;
    @Expose()
    fullName: string;

    @Expose()
    email: string;

    @Expose()
    phone: string;
    @Expose()
    phoneSecondary: string;
    @Expose()
    language: Language;
    @Expose()
    carryingCapacity: CarryingCapacity;
    @Expose()
    prefersOverlappingShift: boolean;
    @Expose()
    specialties: string;
    @Expose()
    disabilities: string;
    @Expose()
    noteByMember: string;

    @Expose()
    teamId: number;

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }
}
