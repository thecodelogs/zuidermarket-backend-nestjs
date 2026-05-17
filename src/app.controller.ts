import { Controller, Get, Header, HttpCode, Logger } from '@nestjs/common';

@Controller()
export class AppController {
    logger = new Logger(this.constructor.name);

    @Get()
    async hello() {
        this.logger.log('Sending hello');
        return 'Hello!';
    }

    @Get('robots.txt')
    @Header('content-type', 'text/plain')
    async getRobots() {
        return `User-agent: *\nDisallow: / `;
    }

    @Get('favicon.ico')
    @HttpCode(204)
    async getFavicon() {
        return;
    }
}
