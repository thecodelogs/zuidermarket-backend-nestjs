import { IsOptional } from 'class-validator';
import { Language } from '../enums/language.enum';
import { Gender } from '../enums/gender.enum';
import { CarryingCapacity } from '../enums/carrying-capacity.enum';

export class UpdateOwnUserDto {
    @IsOptional()
    phone: string;
    @IsOptional()
    phoneSecondary: string;
    @IsOptional()
    language: Language;
    @IsOptional()
    gender: Gender;
    @IsOptional()
    dateOfBirth: Date;
    @IsOptional()
    carryingCapacity: CarryingCapacity;
    @IsOptional()
    prefersOverlappingShift: boolean;
    @IsOptional()
    address: string;
    @IsOptional()
    postcode: string;
    @IsOptional()
    city: string;
    @IsOptional()
    specialties: string;
    @IsOptional()
    disabilities: string;
    @IsOptional()
    noteByMember: string;
}
