import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { addDays, format } from 'date-fns';
import { EventService } from 'src/event/event.service';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { ConfigService } from './../config/config.service';
import { CalendarEvent } from './../event/event.entity';
import { MailService } from './../mail/mail.service';
import { User } from './../user/user.entity';
import { Notification } from './notification.entity';

const EVERY_SUNDAY_AT_11_30 = '30 11 * * 0';

@Injectable()
export class NotificationService extends TypeOrmCrudService<Notification> {
    logger = new Logger(this.constructor.name);
    constructor(
        @InjectRepository(Notification)
        notificationRepo: Repository<Notification>,
        @InjectRepository(CalendarEvent)
        private eventRepo: Repository<CalendarEvent>,
        private mailService: MailService,
        private configService: ConfigService,
        private eventService: EventService,
    ) {
        super(notificationRepo);
    }

    getPostEventMessage(user: User, event: CalendarEvent) {
        const link =
            this.configService.config.frontendUrl +
            '/#/auth/rooster/' +
            event.id;
        return `<p>Beste ${user.firstName},</p>
    <p>Jouw team heeft op de markt van ${format(
        new Date(event.start),
        'd-M',
    )} gestaan!</p>
    <p>Hopelijk is alles naar wens verlopen en is het leuk geweest!</p>
    <p>Vergeet je alsjeblieft niet aan te geven in Zuidermakkie wie er allemaal bij was?</p>
    <p>Dit is essentieel om de reservelijst goed bij te houden!</p>
    <p>Klik op deze link om de update te doen:</p>
    <p><a href='${link}'>${link}</a></p>
    <p>Met vriendelijke groet,</p>
    <p>ZuiderMRKT.</p>
    <br>
    <p>--- Deze mail is automatisch verzonden vanuit ZUIDERMAKKIE naar iedere marktmeester aanwezig
    op de markt van ${format(new Date(event.start), 'd-M')}. ---</p>
    `;
    }

    async sendPostEventReminder(event: CalendarEvent) {
        if (!event.teamId) {
            return;
        }
        this.logger.log('sending reminder for event with id: ' + event.id);
        event.team.users
            .filter((user) => user.roles.includes('market-lead'))
            .forEach((user) => {
                this.logger.log(
                    'sending post event reminder to user with id: ' + user.id,
                );
                this.mailService.addToQueue({
                    to: user.email,
                    subject: `Markt: ${format(
                        new Date(event.start),
                        'd-M',
                    )}: Vergeet niet door te geven wie aanwezig was!`,
                    html: this.getPostEventMessage(user, event),
                });
            });
    }

    @Cron(EVERY_SUNDAY_AT_11_30)
    async postEventReminders() {
        const today = new Date();
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const todayEvents = await this.eventService.findBetweenDates(
            yesterday,
            today,
        );
        todayEvents.forEach((event) => {
            this.sendPostEventReminder(event);
        });
    }

    @Cron(EVERY_SUNDAY_AT_11_30)
    async sendRsvpReminders() {
        const upcomingEvents = await this.getUpcomingEvents(27, 32);
        this.logger.debug(`${upcomingEvents.length} upcoming events found.`);
        upcomingEvents.forEach((event) => {
            const notResponded = event.notResponded;
            this.logger.debug(`${notResponded.length} members not responded.`);
            notResponded.forEach((user) => {
                this.mailService.addToQueue({
                    to: user.email,
                    subject: `Markt ${format(
                        new Date(event.start),
                        'd-M',
                    )}: laat even weten of je erbij bent`,
                    html: this.getReminderMessage(event, user),
                    from: `"ZuiderMAKKIE" <system@zuidermakkie.nl>`,
                });
            });
        });
    }

    private getReminderMessage(event: CalendarEvent, user: User): string {
        const baseUrl = this.configService.config.frontendUrl;
        const rsvpUrl = `${baseUrl}/#/auth/rooster/${event.id}`;
        return `<p>Beste ${user.firstName},</p>
    <p>Jouw team is ingeroosterd op ${format(
        new Date(event.start),
        'd-M',
    )}, maar
    het lijkt erop dat je in ZuiderMAKKIE nog niet hebt doorgegeven of je kan.</p>
    <p>Laat je team z.s.m. weten of je aanwezig bent via deze link: </p>
    <p><a href='${rsvpUrl}'>${rsvpUrl}</a></p>
    <p>Vanaf 4 weken voor de marktdienst kunnen anderen zich ook inschrijven voor de dienst!
    Reageer dus snel!</p>
    <p>Met vriendelijke groet,</p>
    <p>ZuiderMRKT.</p>
    <p>--- Deze mail is automatisch verzonden vanuit ZUIDERMAKKIE naar ieder lid van 
			${event.team.name} die nog niet heeft bevestigd aanwezig te zijn. ---</p>
    `;
    }

    @Cron(EVERY_SUNDAY_AT_11_30)
    async preEventReminders() {
        const upcomingEvents = await this.getUpcomingEvents(27, 32);
        this.logger.debug(`${upcomingEvents.length} upcoming events found.`);
        upcomingEvents.forEach((event) => {
            if (event.going <= 9) {
                this.logger.debug(
                    `Not enough members going to markt. Sending reminder to market leads`,
                );
                event.team.users.forEach((user) => {
                    if (user.roles.includes('market-lead')) {
                        this.mailService.addToQueue({
                            to: user.email,
                            subject: `Te klein team voor markt van ${format(
                                new Date(event.start),
                                'd-M',
                            )}!`,
                            html: this.preEventMessage(
                                event,
                                user,
                                event.going,
                            ),
                            from: `"ZuiderMAKKIE" <system@zuidermakkie.nl>`,
                        });
                    }
                });
            }
        });
    }

    private preEventMessage(event: CalendarEvent, user: User, going: number) {
        return `<p>Beste ${user.firstName},</p>
    <p>Op de zaterdag${event.daypart} van ${format(
            new Date(event.start),
            'd-M',
        )} 
		staat jouw team achter de groentekraam.</p>
	<p>Tot nu toe ${going === 1 ? 'heeft' : 'hebben'} in totaal ${going} ${
            going === 1 ? 'lid' : 'leden'
        } bevestigd te komen (dit is inclusief marktmeesters).</p>
    <p>Teamleden die nog niet hebben aangegeven of ze er bij kunnen zijn ontvangen 30 en 15 dagen 
		van tevoren een reminder vanuit zuidermakkie, maar het is aangeraden om ze zelf ook tijdig een berichtje te sturen.
		Bv via whatsapp. Vanaf 4 weken voor de marktdienst kunnen eventuele invallers in geval van onderbezetting zich ook inschrijven.</p>
	<p>Heb je je team 7 dagen van tevoren niet rond, neem dan contact op met rooster@zuidermrkt.nl</p>
    <p>Met vriendelijke groet,</p>
    <p>ZuiderMRKT.</p>
    <p>--- Deze mail is automatisch verzonden vanuit ZUIDERMAKKIE naar iedere marktmeester van ${
        event.team.name
    }---</p>
    `;
    }

    private async getUpcomingEvents(lower = 1, upper = 8) {
        this.logger.log('Getting upcoming events...');
        const now = new Date();
        const lowerLimit = addDays(now, lower);
        const upperLimit = addDays(now, upper);
        const upcomingEvents = await this.eventRepo.find({
            where: {
                start: Between(lowerLimit, upperLimit),
                isActive: true,
                teamId: Not(IsNull()),
            },
            join: {
                alias: 'event',
                leftJoinAndSelect: {
                    team: 'event.team',
                    teamMembers: 'team.users',
                    rsvps: 'event.rsvps',
                },
            },
        });
        return upcomingEvents;
    }
}
