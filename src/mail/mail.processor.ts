import {
    OnQueueActive,
    OnQueueCompleted,
    OnQueueDrained,
    OnQueueError,
    OnQueueFailed,
    Process,
    Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';
import { ConfigService } from 'src/config/config.service';
import Mail = require('nodemailer/lib/mailer');

@Processor('mail')
export class MailConsumer {
    transporter: Mail;
    logger = new Logger(this.constructor.name);
    queueErrorMessage: string;

    constructor(configService: ConfigService) {
        const config: any =
            configService.config.mail.smtpTransportOptions || {};
        this.transporter = nodemailer.createTransport(config);
    }

    @Process()
    async sendEmail(job: Job<Mail.Options>) {
        const mailOptions = job.data;
        this.logger.log(`Sending email to ${mailOptions.to}`);
        if (!mailOptions.from) {
            mailOptions.from = `"ZuiderMAKKIE" <system@zuidermakkie.nl>`;
        }
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Sent to ${mailOptions.to}`);
    }

    @OnQueueError()
    onError(e: Error) {
        const message = e.message;
        if (this.queueErrorMessage !== message) {
            this.queueErrorMessage = message;
            this.logger.error(`Queue error: ${message}`);
        }
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.log(`Job: ${job.name} started`);
    }

    @OnQueueCompleted()
    onCompleted(job: Job) {
        this.logger.log(`Job: ${job.name} completed`);
    }

    @OnQueueFailed()
    onFailed(job: Job, e: Error) {
        this.logger.error(`Job: ${job.name} failed, Error: ${e.message}`);
    }

    @OnQueueDrained()
    onDrained() {
        this.logger.log(`Queue finished`);
    }
}
