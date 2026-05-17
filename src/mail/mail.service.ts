import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import Mail = require('nodemailer/lib/mailer');

@Injectable()
export class MailService {
    logger = new Logger(this.constructor.name);

    constructor(@InjectQueue('mail') private mailQueue: Queue) {}

    /**
     * Async. adds the new user's email to a queue.
     *
     * If the process failed or completed, removes the mail from the queue.
     *
     * @param mail Mail object to add to the queue
     */
    async addToQueue(mail: Mail.Options): Promise<void> {
        this.logger.log(
            `Adding email from ${mail.from} to ${mail.to} to mail queue`,
        ); // TODO change this log
        await this.mailQueue.add(mail, {
            attempts: 2,
            backoff: 1000,
            timeout: 20000,
            removeOnFail: true,
            removeOnComplete: true,
        });
    }
}
