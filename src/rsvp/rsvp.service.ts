import { EventService } from './../event/event.service';
import { RsvpResponse } from './enums/rsvp-response.enum';
import { UserService } from 'src/user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Rsvp } from './rsvp.entity';
import { IUserJwt } from '../user/interfaces/user-jwt.interface';
import { CreateOwnRsvpDto } from './dto/create-own-rsvp.dto';
import { from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Cron, Timeout } from '@nestjs/schedule';
import { CalendarEvent } from 'src/event/event.entity';
import { TeamService } from 'src/team/team.service';
import { User } from 'src/user/user.entity';
import { In } from 'typeorm';

const EVERY_SATURDAY = '0 0 0 0 6';

@Injectable()
export class RsvpService extends TypeOrmCrudService<Rsvp> {
    logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(Rsvp) repo,
        private userService: UserService,
        private eventService: EventService,
        private teamService: TeamService,
    ) {
        super(repo);
    }

    /**
     * Checks if rsvp is only for events from past.
     * @param dto Data Transfer Object
     * @returns Promise boolean, whether the event is from the past or not
     */
    checkIfFutureDate(dto: CreateOwnRsvpDto): Promise<boolean> {
        const now = new Date();
        return this.eventService
            .findOne(dto.eventId)
            .then((event) => (event.start < now ? true : false));
    }

    /**
     * Async. submits rsvp
     * @param user
     * @param dto
     * @returns Promise observable rsvp
     */
    async submitRsvp(user: IUserJwt, dto: CreateOwnRsvpDto) {
        if (await this.checkIfFutureDate(dto)) {
            this.logger.error(
                'Attempt to make rsvp for past event: ' +
                    dto.eventId +
                    ' userid: ' +
                    user.id,
            );
            throw new Error('Date has passed');
        }
        return from(
            this.repo.findOne({
                where: { userId: user.id, eventId: dto.eventId },
            }),
        ).pipe(
            map((rsvp) => (rsvp ? rsvp : new Rsvp())),
            switchMap((rsvp) => {
                rsvp.userId = user.id;
                rsvp.eventId = dto.eventId;
                rsvp.response = dto.response;
                this.updateRsvpScore(rsvp);
                return this.repo.save(rsvp);
            }),
        );
    }

    /**
     * Get rsvp score from a user by its ID.
     * @param userId User ID we want to find
     * @returns Promise number, the rsvp score of the user to find by its ID, or void
     */
    getRsvpScore(userId: number): Promise<number | void> {
        return this.userService.findById(userId).then(
            (user) => {
                return user.rsvpScore;
            },
            (error) => this.logger.error(error),
        );
    }

    /**
     * Async. updates rsvp score of the user of a given rsvp.
     * @param rsvp rsvp with the user ID we want to update the score
     * @returns Promise user, the updated score of a given user by its ID
     */
    private async updateRsvpScore(rsvp: Rsvp) {
        return this.userService.findById(rsvp.userId).then(
            (user) => {
                if (
                    rsvp.response === RsvpResponse.YES &&
                    rsvp.attended !== RsvpResponse.NO
                ) {
                    this.logger.log('increasing score for ' + rsvp.id);
                    user.rsvpScore += 1;
                } else if (
                    rsvp.response === RsvpResponse.NO &&
                    rsvp.attended !== RsvpResponse.YES &&
                    user.rsvpScore > 0
                ) {
                    user.rsvpScore -= 1;
                }
                user = this.checkScore(user);
                return this.userService.save(user);
            },
            (error) => this.logger.error(error),
        );
    }

    /**
     * Checks score of a given user, based on score and absent status and set accordingly.
     * @param user User to check the score of
     * @returns User object, the updated user object
     */
    checkScore(user: User): User {
        if (!user.absent && user.rsvpScore < 3) {
            user.absent = true;
            user.absentSince = new Date();
        } else if (user.absent && user.rsvpScore >= 3) {
            user.absent = false;
            user.absentSince = null;
        }
        return user;
    }

    /**
     * Updates absent status for multiple users at once.
     * @param userIds IDs of the users to update the absent status
     * @param absent Boolean, whether the user is absent or not
     */
    async updateAbsentStatusBatch(userIds: number[], absent: boolean) {
        userIds.forEach((id) => {
            this.userService.findById(id).then((user) => {
                this.logger.log(
                    'Updating absent status for user with id:' + user.id,
                );
                if (absent === false) {
                    user.absent = false;
                } else {
                    user = this.checkScore(user);
                }
                this.userService.save(user);
            });
        });
    }

    /**
     * Create an unknown rsvp with a specific user and event.
     * @param user User to add the rsvp to
     * @param event Event to add the rsvp to
     */
    makeUnknownRsvp(user: User, event: CalendarEvent) {
        let rsvp = this.repo.create();
        rsvp.eventId = event.id;
        rsvp.userId = user.id;
        this.logger.log('adding unknown rsvp for: ' + user.fullName);
        this.repo.save(rsvp);
    }

    /**
     * Finds a rsvp based on a given user and event
     * @param user User to be found
     * @param event Event to search
     */
    async findRsvp(user: User, event: CalendarEvent) {
        this.logger.log(
            'finding rsvp for: ' +
                user.id +
                ' ' +
                user.fullName +
                ' eventid: ' +
                event.id,
        );
        const rsvp = await this.repo.findOne({
            where: {
                userId: user.id,
                eventId: event.id,
            },
        });
        if (!rsvp) {
            this.makeUnknownRsvp(user, event);
        } else {
            this.logger.log(
                'rsvp found with id:' + rsvp.id,
                'eventId: ' + event.id,
            );
        }
    }

    /**
     * Adds rsvp
     * @param users
     * @param event
     */
    async addRsvps(users: User[], event: CalendarEvent) {
        const team = await this.teamService.findOne(event.teamId);
        users.forEach((user) => {
            this.logger.log('Comparing user:' + user.id + ' and: ' + event.id);
            if (user.teamId && user.teamId == team.id) {
                this.findRsvp(user, event);
            }
        });
    }

    /**
     *
     * @param events
     * @param users
     */
    async addRsvpsToEvents(events: CalendarEvent[], users: User[]) {
        for (let i = 0; i < events.length; i++) {
            if (events[i].isActive && events[i].teamId) {
                this.logger.log('adding rsvps for event ' + events[i].id);
                this.addRsvps(users, events[i]);
            }
        }
    }

    async addNextTwoWeeks(users: User[]) {
        const now = new Date();
        const inTwoWeeks = new Date(now.setDate(now.getDate() + 14));
        this.eventService.findBetweenDates(now, inTwoWeeks).then(
            (events) => {
                this.addRsvpsToEvents(events, users);
            },
            (error) => {
                this.logger.error(error);
            },
        );
    }

    updateNextTeamEvent(teamId: number, users: User[]) {
        this.eventService.findNextForTeam(teamId).then(
            (nextEvent) => {
                if (nextEvent) {
                    this.logger.log(
                        'next event for team:' + teamId + 'is: ' + nextEvent.id,
                    );
                    this.addRsvpsToEvents(Array.of(nextEvent), users);
                }
            },
            (error) => {
                this.logger.log(error);
            },
        );
    }

    async getTodayTeams(): Promise<number[]> {
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return (
            await this.eventService.findBetweenDates(yesterday, tomorrow)
        ).map((event) => event.teamId);
    }

    @Cron(EVERY_SATURDAY)
    async addWeeklyRsvps() {
        const users = await this.userService.find();
        this.logger.log('adding weekly rsvps');
        this.addNextTwoWeeks(users);
        this.getTodayTeams().then((teamIds) => {
            teamIds.forEach((id) => {
                this.updateNextTeamEvent(id, users);
            });
        });
    }

    /**
     * Checks for three different situations:
     * 1: user has attended an event => score goes up
     * 2: user has signed up for event, but was reported missing at an event => score goes down
     * 3: user has not been reported, then other checks are performed
     * No error checking is done, only logging.
     * Before and after score is used for logging
     * @param user User to update the score
     * @param rsvpId
     * @param response
     * @param attended
     */
    async updateUserScore(
        user: User,
        rsvpId: number,
        response: RsvpResponse,
        attended: RsvpResponse,
    ) {
        let increase = false;
        switch (attended) {
            case RsvpResponse.YES:
                increase = true;
                break;
            case RsvpResponse.UNKNOWN:
                if (response === RsvpResponse.YES) {
                    increase = true;
                }
        }
        if (increase) {
            user.rsvpScore++;
            await this.userService
                .save(user)
                .catch((error) => this.logger.error(error));
        }
        this.logger.log(
            'Rsvpid: ' +
                rsvpId +
                ' score update: ' +
                user.id +
                ': ' +
                user.fullName +
                ' | response: ' +
                response +
                ' | attended: ' +
                attended +
                ' | increase: ' +
                increase,
        );
    }

    /**
     * Gets all users from the rsvps, then loop over data & users to update the score.
     * @param data rsvpID, userID, reponse & attended
     */
    async processData(
        data: {
            rsvpId: number;
            userId: number;
            response: RsvpResponse;
            attended: RsvpResponse;
        }[],
    ) {
        let users: User[] = await this.userService.find({
            where: {
                id: In(data.map((data) => data.userId)),
            },
        });
        for (let i = 0; i < data.length; i++) {
            let to_check = users.find((user) => data[i].userId === user.id);
            await this.updateUserScore(
                to_check,
                data[i].rsvpId,
                data[i].response,
                data[i].attended,
            );
        }
    }

    /**
     * This function is kept to rerun the algorithm in case something went wrong with rsvp score
     * Recounts the rsvpscore for users for 2022. remove timeout comment if needed.
     * Set score of users to 0 before usage, otherwise score is increased over the current score.
     * Gets all rsvps for current year.
     */
    // @Timeout(500) // <--- uncomment this to run
    async recountRsvpScore() {
        const dataToProcess = await this.repo.query(
            "SELECT rsvp.id as rsvpId, rsvp.userId as userId, \
		rsvp.response, rsvp.attended from rsvp \
		LEFT JOIN event ON event.id = rsvp.eventId \
		WHERE event.start > '2022-01-01';",
        );
        this.processData(dataToProcess);
    }
}
