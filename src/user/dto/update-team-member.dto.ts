import { IsNotEmpty, IsOptional } from 'class-validator';
import { EmploymentStatus } from '../enums/employment-status.enum';
import { CarryingCapacity } from '../enums/carrying-capacity.enum';

export class UpdateTeamMemberDto {
    @IsNotEmpty()
    readonly status?: EmploymentStatus;
    @IsNotEmpty()
    readonly carryingCapacity?: CarryingCapacity;
}
