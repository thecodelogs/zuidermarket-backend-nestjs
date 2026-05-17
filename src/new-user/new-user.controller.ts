import { Observable } from 'rxjs';
import { NewUserService } from './new-user.service';
import { Logger } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@Controller('new-user')
export class NewUserController {
    logger = new Logger(this.constructor.name);

    constructor(private readonly newUserService: NewUserService) {}

    /**
     * Sends confirmation email regarding the new user form.
     *
     * Endpoint of the email confirmation send request.
     *
     * @param body Object, the email used by the new user
     * @returns Promise, the confirmation email sent, or display an error message
     */
    @Throttle(5, 60)
    @Post('send-confirmation-email')
    sendConfirmationEmail(@Body() body: { email: string }) {
        const { email } = body;
        return this.newUserService.sendEmailConfirmation(email);
    }

    /**
     * Async. processes post request from the form filled in by the new user.
     *
     * Endpoint of the new user form processing request.
     *
     * @param body Object, key-pairs containing the values of the form
     * @returns Promise, the id of the new user, or log an error
     */
    @Post('post-user-form')
    async processForm(
        @Body() body: Array<{ [key: string]: string }>,
    ): Promise<number | Observable<never>> {
        return this.newUserService.processForm(
            body['formValues'],
            body['email'],
        );
    }
}
