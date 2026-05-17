import { throwError, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { CarryingCapacity } from 'src/user/enums/carrying-capacity.enum';
import { Language } from 'src/user/enums/language.enum';
import { Gender } from 'src/user/enums/gender.enum';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NewUserService {
    logger = new Logger(this.constructor.name);
    private readonly frontendUrl: string;

    constructor(
        private readonly userService: UserService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) {
        this.frontendUrl = this.configService.config.frontendUrl;
    }

    /**
     * Async. sends confirmation email to the new user.
     *
     * Checks if the email address is already in use and then generates a token with JWT.
     *
     * @param email Email of the new user to be used
     * @returns Promise, the user's email added to the queue
     */
    async sendEmailConfirmation(email: string) {
        if (await this.userService.findByEmail(email)) {
            this.logger.log(
                `Attempted to make new account with ${email}. Email already in use. `,
            );
            return { error: 'Email wordt al gebruikt.' };
        }
        this.logger.log(`Sending confirmation email to ${email}`);
        const token = this.jwtService.sign(
            { email },
            {
                expiresIn: '24h',
            },
        );
        this.logger.log(`Token: ` + token);

        return this.mailService.addToQueue({
            to: email,
            subject: 'Lid worden van Zuidermakkie!',
            text: this.getConfirmationEmail(token),
        });
    }

    /**
     * Gets the text of the confirmation email sent to the new user, containing the link to the new user form.
     * @param token	Token linked to the new user's form
     * @returns Message content of the confirmation email, with a link to the new user form
     */
    private getConfirmationEmail(token: string): string {
        // this.logger.log(`${this.frontendUrl}/#/public/lid-worden/${token}`); // ? testing
        return `Beste Toekomstig ZuiderMRKT lid!
		
		Dit is een bevestigingsmail namens de Zuidermarkt.
		Klik op onderstaande link om verder te gaan met het maken van je account:
		${this.frontendUrl}/#/public/lid-worden/${token} 

		Deze link vervalt na een dag!
		Met vriendelijke groet,
		ZuiderMAKKIE`;
    }

    /**
     * Async. processes the form filled in by the new user.
     * @param formValues 	Values from the form to be processed
     * @param email 		Email used by the new user
     * @returns Promise, the new user being saved to the database
     */
    async processForm(
        formValues: { [key: string]: string },
        email: string,
    ): Promise<number | Observable<never>> {
        // TODO do something with teampref
        let user: User;
        return this.saveUser(this.constructUser(formValues, email)).then(
            (response) => {
                user = response;
                return user.id;
            },
            (error) => {
                this.logger.error(error);
                return throwError(() => new Error(error));
            },
        );
    }

    /**
     * Async. saves the constructed new user into the database.
     * @param userDetails Details from the new user
     * @returns Promise, the new user saved into the database
     */
    async saveUser(userDetails: User): Promise<User> {
        this.logger.log(
            'Saving account details for ' +
                userDetails.firstName +
                ' ' +
                userDetails.lastName,
        );
        return this.repo.save(userDetails);
    }

    /**
     * Constructs the user with the values from the form filled in by the new user, to be saved into the database.
     * ? Better ways of doing it
     * @param formValues	Values from the form filled in by the new user
     * @param email			Email used by the new user
     * @returns The constructed user
     */
    private constructUser(
        formValues: { [key: string]: string },
        email: string,
    ): User {
        let user = new User();
        user.email = email;
        user.firstName = formValues['firstName'];
        user.lastNamePrefix = formValues['lastNamePrefix']
            ? formValues['lastNamePrefix']
            : null;
        user.lastName = formValues['lastName'];
        user.phone = formValues['phone'];
        user.password = formValues['password'];
        user.gender = this.getGender(formValues['gender']);
        user.dateOfBirth = new Date(formValues['dateOfBirth']);
        user.address = formValues['address'];
        user.postcode = formValues['postcode'];
        user.city = formValues['city'];
        user.nationality = formValues['nationality']
            ? formValues['nationality']
            : null;
        user.language = this.getLanguage(formValues['language']);
        user.carryingCapacity = this.getCarryingCapacity(
            formValues['carryingCapacity'],
        );
        user.specialties = formValues['specialties']
            ? formValues['specialties']
            : null;
        user.noteByMember = formValues['noteByMember']
            ? formValues['noteByMember']
            : null;
        user.roles = ['member'];
        return user;
    }

    private getCarryingCapacity(formValue: string): CarryingCapacity {
        if (formValue === 'medium') {
            return CarryingCapacity.MEDIUM;
        } else if (formValue === 'low') {
            return CarryingCapacity.LOW;
        }
    }

    private getLanguage(formValue: string): Language {
        if (formValue === 'nl') {
            return Language.DUTCH;
        } else if (formValue === 'eng') {
            return Language.ENGLISH;
        }
    }

    private getGender(formValue: string): Gender {
        if (formValue === 'male') {
            return Gender.MALE;
        } else if (formValue === 'female') {
            return Gender.FEMALE;
        } else if (formValue === 'other') {
            return Gender.OTHER;
        }
    }
}
