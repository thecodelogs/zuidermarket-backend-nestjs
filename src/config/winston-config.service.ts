import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from './config.service';
import { ILogConfig } from './interfaces/app-config.interface';
import SlackHook = require('winston-slack-webhook-transport');

const { combine, timestamp, printf } = winston.format;

const slackFormatter = (info: any) => {
    return {
        text: `${info.timestamp} [${process.env.NODE_ENV}] [${info.context}] ${info.level}: ${info.message}`,
    };
};
@Injectable()
export class WinstonConfigService {
    private readonly config: ILogConfig;
    private readonly appName: string;
    logFormat = printf(
        ({ level, message, timestamp: ts, context }) =>
            `${ts} [${context}] ${level}: ${message}`,
    );

    constructor(configService: ConfigService) {
        this.config = configService.config.logging;
        this.appName = `${configService.appName} ${configService.appVersion} ${
            process.env.NODE_ENV || 'development'
        }`;
    }

    createWinstonModuleOptions(): winston.LoggerOptions {
        const transports = [];
        if (this.config.console) {
            transports.push(
                new winston.transports.Console({
                    level: this.config.console.level || 'info',
                }),
            );
        }
        if (this.config.file) {
            transports.push(
                new winston.transports.File({
                    level: this.config.file.level || 'info',
                    filename: this.config.file.path || 'logs/combined.log',
                }),
            );
        }
        if (this.config.slack) {
            transports.push(
                // @ts-ignore
                new SlackHook({
                    webhookUrl: this.config.slack.webhookUrl,
                    level: this.config.slack.level || 'warn',
                    channel: this.config.slack.channel,
                    formatter: slackFormatter,
                    username: this.appName,
                }),
            );
        }
        const logConfig: winston.LoggerOptions = {
            levels: {
                error: 0,
                warn: 1,
                info: 2,
                debug: 3,
                verbose: 3,
            },
            level: this.config.level || 'info',
            format: combine(timestamp(), this.logFormat),
            transports,
        };
        return logConfig;
    }
}
