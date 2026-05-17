import { IsArray, IsNotEmpty } from 'class-validator';

export class SubmitRegistrationsDto {
    @IsNotEmpty()
    year: string;
    @IsArray()
    eventIds: number[];
}
