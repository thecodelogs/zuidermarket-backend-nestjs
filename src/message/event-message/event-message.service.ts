import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, mapTo, switchMap } from 'rxjs/operators';
import { RsvpResponse } from 'src/rsvp/enums/rsvp-response.enum';
import { Repository } from 'typeorm';
import { ConfigService } from './../../config/config.service';
import { MailService } from './../../mail/mail.service';
import { IUserJwt } from './../../user/interfaces/user-jwt.interface';
import { User } from './../../user/user.entity';
import { EventMessage } from './event-message.entity';
import { EventMessageRecipientGroup } from './event-message-recipient-group.enum';
import { EventMessageDto } from './event-message.dto';

@Injectable()
export class EventMessageService extends TypeOrmCrudService<EventMessage> {
    logger = new Logger(this.constructor.name);

    constructor(
        private mailService: MailService,
        private config: ConfigService,
        @InjectRepository(EventMessage)
        messageRepo: Repository<EventMessage>,
    ) {
        super(messageRepo);
    }

    addMessage(user: IUserJwt, dto: EventMessageDto): Observable<EventMessage> {
        const newMessage = new EventMessage();
        newMessage.body = dto.body;
        newMessage.subject = dto.subject;
        newMessage.eventId = dto.eventId;
        newMessage.sentByUserId = user.id;
        newMessage.recipientGroup = dto.recipientGroup;
        return from(this.repo.save(newMessage)).pipe(
            switchMap((message) => this.joinRelatedUsers(message)),
            switchMap((messageWithUsers) =>
                this.sendEmails(messageWithUsers, dto.recipientGroup),
            ),
            mapTo(null),
        );
    }

    private joinRelatedUsers(message: EventMessage): Promise<EventMessage> {
        return this.repo.findOneOrFail(message.id, {
            relations: [
                'sentByUser',
                'event',
                'event.team',
                'event.team.users',
                'event.rsvps',
                'event.rsvps.user',
            ],
        });
    }

    private sendEmails(
        messageWithRelatedUsers: EventMessage,
        recipientGroup: EventMessageRecipientGroup = EventMessageRecipientGroup.EntireTeamAndSubstituteAttendees,
    ) {
        const recipients: User[] = this.getRecipients(
            messageWithRelatedUsers,
            recipientGroup,
        );
        if (recipients.length === 0) {
            return of(null);
        }
        const sender = messageWithRelatedUsers.sentByUser;
        return this.createMailQueue(
            recipients,
            messageWithRelatedUsers,
            sender,
        );
    }

    private createMailQueue(
        recipients: User[],
        messageWithRelatedUsers: EventMessage,
        sender: User,
    ) {
        return forkJoin(
            recipients.map((recipient) =>
                from(
                    this.mailService.addToQueue(
                        this.getMailConfig(
                            recipient,
                            messageWithRelatedUsers,
                            sender,
                        ),
                    ),
                ).pipe(
                    catchError((e) => {
                        return this.logQueueError(sender, recipient, e);
                    }),
                ),
            ),
        );
    }

    private getMailConfig(
        recipient: User,
        messageWithRelatedUsers: EventMessage,
        sender: User,
    ) {
        return {
            to: recipient.email,
            subject: this.getSubject(messageWithRelatedUsers),
            html: this.getUserSpecificMessage(
                recipient,
                messageWithRelatedUsers,
            ),
            replyTo: sender.email,
            from: `"${sender.fullName} via ZuiderMAKKIE" <system@zuidermakkie.nl>`,
        };
    }

    private logQueueError(sender: User, recipient: User, e: any) {
        this.logger.error(
            `Could not add event email from ${sender.email} to ${recipient.email} to queue: ${e.message}`,
        );
        return of(null);
    }

    private getRecipients(
        message: EventMessage,
        recipientGroup: EventMessageRecipientGroup,
    ): User[] {
        let recipients: User[] = [];
        const event = message.event;
        const teamMembers = event.team.users;
        const attending = event.rsvps
            .filter((r) => r.response === RsvpResponse.YES)
            .map((r) => r.user);

        if (
            recipientGroup ===
            EventMessageRecipientGroup.EntireTeamAndSubstituteAttendees
        ) {
            recipients = this.getTeamAndSubstituteAttendees(
                recipients,
                teamMembers,
                attending,
            );
        } else if (recipientGroup === EventMessageRecipientGroup.Attending) {
            recipients = attending;
        } else if (recipientGroup === EventMessageRecipientGroup.NotResponded) {
            const notResponded = teamMembers.filter(
                (m) => !event.rsvps.some((rsvp) => rsvp.userId === m.id),
            );
            recipients = notResponded;
        } else if (recipientGroup === EventMessageRecipientGroup.Nobody) {
            recipients = [];
        }
        return recipients;
    }

    private getTeamAndSubstituteAttendees(
        recipients: User[],
        teamMembers: User[],
        attending: User[],
    ) {
        recipients = [...teamMembers, ...attending].filter(
            (u, index, arr) =>
                arr.findIndex((user) => user.id === u.id) === index,
        );
        return recipients;
    }

    private getUserSpecificMessage(
        recipient: User,
        message: EventMessage,
    ): string {
        const text = `<span style="white-space: pre-line;">${message.body}</span><hr><p>Verzonden via ZuiderMAKKIE door ${message.sentByUser.fullName} aan ${recipient.email}</p>
    <p><a href="${this.config.config.frontendUrl}/#/auth/rooster/${message.eventId}">Reageer online</a></p>`;
        return text;
    }

    private getSubject(message: EventMessage) {
        if (message.subject) {
            return message.subject;
        }
        const start = message.event.start;
        const day = start.getDate();
        const month = [
            'januari',
            'februari',
            'maart',
            'april',
            'mei',
            'juni',
            'juli',
            'augustus',
            'september',
            'oktober',
            'november',
            'december',
        ][start.getMonth()];
        return `Markt van ${day} ${month}`;
    }
}
