import { User } from 'src/user/user.entity';
import { MailService } from './../mail/mail.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from './../config/config.service';
import createMollieClient, {
    MollieClient,
    Payment,
    PaymentMethod,
    PaymentStatus,
} from '@mollie/api-client';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MollieService {
    private readonly mollieService: MollieClient;
    private readonly frontendUrl: string;
    private readonly webhookEndpoint: string;
    logger = new Logger(this.constructor.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly mailService: MailService,
    ) {
        this.frontendUrl = this.configService.config.frontendUrl;
        this.webhookEndpoint = '/mollie/payment-status-webhook';
        this.mollieService = createMollieClient({
            apiKey: configService.config.mollie.apiKey,
        });
    }

    /**
     * Async. creates a payment for a given user ID.
     *
     * See Mollie documentation for more info.
     *
     * @param userId User ID linked to the payment
     * @returns Promise, the created payment
     */
    async createPayment(userId: number): Promise<Payment> {
        this.logger.log('Creating payment for userId: ' + userId);
        return this.mollieService.payments.create({
            amount: {
                currency: 'EUR',
                value: '50.00',
            },
            method: this.getPaymentMethods(),
            metadata: { userId: userId },
            description: 'Zuidermakkie lidmaatschapsbetaling. #' + userId,
            webhookUrl: this.configService.config.apiUrl + this.webhookEndpoint, // ! default: this.configService.config.apiUrl
            redirectUrl:
                this.frontendUrl + '/#/public/lid-worden/status/' + userId,
        });
    }

    private getPaymentMethods(): PaymentMethod[] {
        return [
            PaymentMethod.ideal,
            PaymentMethod.applepay,
            PaymentMethod.creditcard,
            PaymentMethod.directdebit,
            PaymentMethod.paypal,
            PaymentMethod.banktransfer,
        ];
    }

    /**
     * Async. starts a payment for the first time payment by a user.
     *
     * @param userId User ID linked to the payment
     * @returns Promise, the checkout url the user is being sent to
     */
    async startPayment(userId: number): Promise<string> {
        // this.logger.log(`Starting payment for userId: ` + userId); // ? testing
        const payment = await this.createPayment(userId);
        // this.logger.log(`payment: ` + payment); // ? testing
        let user = await this.userService.findById(userId);
        user.paymentId = payment.id;
        this.userService.save(user);
        return payment.getCheckoutUrl();
    }

    /**
     * Async. retries a payment for a user that cancelled or logged in without having paid.
     *
     * Finds the user by its ID, as well as the payment ID.
     * If no payment were found, or if the payment status is not open and pending, restart the payment.
     *
     * @param userId User ID linked to the payment
     * @returns Promise, the checkout url the user is being sent to
     */
    async retryPayment(userId: number): Promise<string> {
        const user = await this.userService.findById(userId);
        let payment = await this.findById(user.paymentId);
        // this.logger.log(`Payment status on retry: ` + payment.status); // ? testing
        if (
            !payment ||
            (payment.status !== 'open' && payment.status !== 'pending')
        ) {
            payment = await this.restartPayment(user);
        }
        return payment.getCheckoutUrl();
    }

    /**
     * Async. restarts a payment for a given user.
     *
     * Creates the payment with the user's ID and saves the user's information to the database.
     *
     * @param user User linked to the payment
     * @returns Promise, the created payment
     */
    private async restartPayment(user: User) {
        this.logger.log(`Restarting payment for userId: ` + user.id);
        const payment = await this.createPayment(user.id);
        user.paymentId = payment.id;
        // this.logger.log(`Payment status on restart: ` + payment.status); // ? testing
        this.userService.save(user);
        return payment;
    }

    /**
     * Async. processes the Mollie webhook.
     *
     * Finds the payment with the given paymentId.
     * Finds the user using the userId stored in the metadata of the payment.
     * Reads the payment status and saves it to the user's information.
     * Based on the status, sends a payment confirmation, or error log. And saves user to database.
     *
     * @param paymentId ID of the payment to be processed
     * @returns Promise, the user being saved to the database
     */
    async processWebhook(paymentId: string) {
        this.logger.log('Received mollie webhook for id: ' + paymentId);
        const payment = await this.findById(paymentId);
        if (!payment) {
            return;
        }
        const userId: number = payment.metadata['userId'];
        let user = await this.userService.findById(userId);
        const status = this.readStatus(payment.status);
        // this.logger.log(`Payment Status: `+ status); // ? testing
        // const status = true; // TODO remove, testing
        user.hasPaidEntryFee = status;
        if (status) {
            this.logger.log(
                'Payment for ' + userId + ' was succesful! ' + paymentId,
            );
            this.sendPaymentConfirmation(user, paymentId);
        } else {
            this.logger.log('Error with payment webhook');
        }
        this.userService.save(user);
    }

    async findById(id: string): Promise<Payment> {
        return this.mollieService.payments.get(id);
    }

    private readStatus(status: PaymentStatus): boolean {
        if (status === PaymentStatus.paid) {
            return true;
        }
        return false;
    }

    private sendPaymentConfirmation(user: User, paymentId: string) {
        this.mailService.addToQueue({
            to: user.email,
            subject: 'Betaling ontvangen voor Zuidermakkie!',
            text: this.getEmailText(user, paymentId),
        });
    }

    /**
     * Gets the text content of the email to be sent to the new user.
     *
     * When testing locally, the payment ID is undefined, that is not the case in the live version.
     *
     * @param user
     * @param paymentId
     * @returns
     */
    private getEmailText(user: User, paymentId: string) {
        return `Beste ${user.firstName} ${user.lastName}!
		Uw betaling met id nummer ${paymentId} is ontvangen!
		Uw account is nu klaar om te gebruiken!`;
    }

    /**
     * Async. gets the entry fee status of a given user ID.
     *
     * @param id ID of the user to be found
     * @returns Promise, whether the user paid the entry fee or not
     */
    async getEntryFeeStatus(id: number): Promise<boolean> {
        const user = await this.userService.findById(id);
        // this.logger.log(`User Entry Fee: ` + user.hasPaidEntryFee); // ? testing
        return user.hasPaidEntryFee;
    }
}
