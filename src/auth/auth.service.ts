import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { MailService } from '../mail/mail.service';
import { IUserJwt } from '../user/interfaces/user-jwt.interface';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import nanoid = require('nanoid');

@Injectable()
export class AuthService {
    refreshTokens = {}; // TODO persist refresh tokens in database
    passwordResetTokens = {}; // TODO persist reset tokens in database
    logger = new Logger(this.constructor.name);

    private readonly frontendUrl: string;

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        configService: ConfigService,
    ) {
        this.frontendUrl = configService.config.frontendUrl;
    }

    /**
     * Async. validates user credentials.
     * @param username Username to validate
     * @param pass     Password to validate
     * @returns Promise, either the validated user or null
     */
    async validateUser(username: string, pass: string): Promise<any> {
        const email = username;
        const user = await this.userService.findByEmail(email);
        if (user && (await this.passwordsAreEqual(pass, user.password))) {
            const { password, ...result } = user;
            this.logger.log(`Validated user ${username}`);
            return result;
        }
        this.logger.log(`Bad login attempt for user ${username}`);
        return null;
    }

    /**
     * Async. compares the entered password with user's hashed password.
     * @param plainPassword  Password the user entered, to be compared
     * @param userPassword   User's password in database, to be hashed and compared to
     * @returns Promise, whether the passwords are equal or not
     */
    private async passwordsAreEqual(
        plainPassword: string,
        userPassword: string,
    ): Promise<boolean> {
        return await bcrypt.compare(plainPassword, userPassword);
    }

    /**
     * Async. logins user with JSON Web Token.
     * @param user Current user to log in
     * @returns Promise, access and refresh tokens of the current user
     */
    async login(user: User) {
        const payload = this.getTokenPayload(user);
        const refreshToken = nanoid(48);
        this.refreshTokens[refreshToken] = user.email;
        if (user.roles.includes('admin')) {
            this.logger.warn(`Admin login ${user.email}`);
        }
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken,
        };
    }

    /**
     * Gets the payload associated to the token.
     * @param user User to get the payload from
     * @returns Payload, all login information from the user (email, id, role, entry fee status)
     */
    private getTokenPayload(user: User) {
        const { email, id, roles, hasPaidEntryFee } = user;
        // this.logger.log(`User entry fee: ` + hasPaidEntryFee); // ? testing
        const payload = { email, id, roles, hasPaidEntryFee };
        return payload;
    }

    async logout(refreshToken: string) {
        if (refreshToken in this.refreshTokens) {
            this.logger.log(
                `Removing refresh token for user ${this.refreshTokens[refreshToken]}`,
            );
            delete this.refreshTokens[refreshToken];
        }
    }

    async refresh(refreshToken: string) {
        if (refreshToken in this.refreshTokens) {
            this.logger.log(
                `Refreshing token for user ${this.refreshTokens[refreshToken]}`,
            );
            const email = this.refreshTokens[refreshToken];
            const user = await this.userService.findByEmail(email);
            const payload = this.getTokenPayload(user);
            return {
                accessToken: this.jwtService.sign(payload),
            };
        } else {
            this.logger.log(`Invalid refresh token`);
            throw new UnauthorizedException();
        }
    }

    async sendPasswordResetLink(email: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            this.logger.log(`${email} not found. Cannot send reset link`);
            return;
        }
        const token = this.jwtService.sign(this.getTokenPayload(user), {
            expiresIn: '1h',
        });
        this.passwordResetTokens[token] = user.email;
        // TODO user email templating library
        const message = `Beste ZuiderMAKKIE-gebruiker,

		Je hebt aangegeven dat je een nieuw wachtwoord wil instellen voor je ZuiderMAKKIE-account.

		Klik op onderstaande link om een nieuw wachtwoord aan te maken:

		${this.frontendUrl}/#/public/wachtwoord-reset/${token}

		Met vriendelijke groet,
		ZuiderMAKKIE
		`;
        return this.mailService.addToQueue({
            to: email,
            subject: 'Stel je wachtwoord opnieuw in',
            text: message,
        });
    }

    async changePassword(
        newPassword: string,
        authUser: IUserJwt,
        token: string,
    ) {
        if (token in this.passwordResetTokens) {
            this.logger.log(
                `Changing password for user ${this.passwordResetTokens[token]}`,
            );
            const user = await this.userService.findByEmail(authUser.email);
            user.password = await bcrypt.hash(newPassword, 10);
            const result = await this.userService.save(user);
            if (result) {
                delete this.passwordResetTokens[token];
                from(
                    this.mailService.addToQueue({
                        to: authUser.email,
                        subject: 'Wachtwoord gewijzigd',
                        text: 'Het wachtwoord van je ZuiderMAKKIE-account is gewijzigd. ',
                    }),
                )
                    .pipe(catchError(() => of()))
                    .subscribe();
            }
        } else {
            this.logger.log(`Invalid password reset token`);
            throw new UnauthorizedException();
        }
    }
}
