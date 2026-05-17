import { IsNotEmpty } from 'class-validator';
import { RsvpResponse } from '../enums/rsvp-response.enum';

export class CreateOwnRsvpDto {
    @IsNotEmpty()
    eventId: number;

    @IsNotEmpty()
    response: RsvpResponse;
}
