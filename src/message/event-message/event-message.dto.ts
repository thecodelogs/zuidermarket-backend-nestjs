import { IsOptional, IsNotEmpty } from 'class-validator';
import { EventMessageRecipientGroup } from './event-message-recipient-group.enum';

export class EventMessageDto {
    @IsOptional()
    subject: string;
    @IsOptional()
    body: string;
    @IsNotEmpty()
    eventId: number;
    @IsOptional()
    recipientGroup: EventMessageRecipientGroup;
}
