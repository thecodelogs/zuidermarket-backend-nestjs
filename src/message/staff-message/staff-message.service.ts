import { catchError, switchMap, mapTo } from 'rxjs/operators';
import { forkJoin, from, of } from 'rxjs';
import { UserService } from './../../user/user.service';
import { CreateStaffMessageDto } from './create-staff-message.dto';
import { IUserJwt } from './../../user/interfaces/user-jwt.interface';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { MailService } from './../../mail/mail.service';
import { StaffMessage } from './staff-message.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class StaffMessageService extends TypeOrmCrudService<StaffMessage> {
    logger = new Logger(this.constructor.name);
    constructor(
        private mailService: MailService,
        private userService: UserService,
        @InjectRepository(StaffMessage)
        staffMessageRepo: Repository<StaffMessage>,
    ) {
        super(staffMessageRepo);
    }

    async addMessage(user: IUserJwt, message: CreateStaffMessageDto) {
        const recipients = await this.userService
            .findByRoles(message.recipientGroups)
            .toPromise();
        const sender = await this.userService.findById(user.id);
        const staffMessage = new StaffMessage();
        staffMessage.body = message.body;
        staffMessage.subject = message.subject;
        staffMessage.sentByUserId = user.id;
        staffMessage.recipientGroups = message.recipientGroups;
        return from(this.repo.save(staffMessage)).pipe(
            switchMap(() => this.createMailQueue(recipients, sender, message)),
            mapTo(null),
        );
    }

    private createMailQueue(
        recipients: User[],
        sender: User,
        message: CreateStaffMessageDto,
    ) {
        return forkJoin(
            recipients.map((recipient) =>
                from(
                    this.mailService.addToQueue({
                        to: recipient.email,
                        subject: message.subject,
                        html: message.body,
                        replyTo: sender.email,
                        from: `"${sender.fullName} via ZuiderMAKKIE" <system@zuidermakkie.nl>`,
                    }),
                ).pipe(
                    catchError((e) => this.logQueueError(sender, recipient, e)),
                ),
            ),
        );
    }

    private logQueueError(sender: User, recipient: User, e: any) {
        this.logger.error(
            `Could not add email from ${sender.email} to ${recipient.email} to queue: ${e.message}`,
        );
        return of(null);
    }
}
