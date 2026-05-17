import { ArrayMinSize, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from './../../user/types/user-role.type';

export class CreateStaffMessageDto {
    @IsOptional()
    subject: string;
    @IsNotEmpty()
    body: string;
    @ArrayMinSize(1)
    recipientGroups: UserRole[];
}
