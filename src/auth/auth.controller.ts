import {
    Body,
    Controller,
    Get,
    HttpCode,
    Logger,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ExtractJwt } from 'passport-jwt';
import { AuthUser } from '../decorators/auth-user.decorator';
import { IUserJwt } from '../user/interfaces/user-jwt.interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    logger = new Logger(this.constructor.name);

    constructor(private readonly authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        this.logger.log(`User ${req.user.email} logged in`);
        return this.authService.login(req.user);
    }

    @Post('refresh')
    async refresh(@Body() body) {
        return this.authService.refresh(body.refreshToken);
    }

    @HttpCode(204)
    @Post('logout')
    async logout(@Body() body) {
        this.authService.logout(body.refreshToken);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('current-user')
    getProfile(@Request() req) {
        return req.user;
    }

    @Throttle(5, 60)
    @Post('send-reset-link')
    async sendPasswordResetLink(@Body() body: { username: string }) {
        const { username } = body;
        this.logger.log(`Password reset requested by ${username}`);
        return this.authService.sendPasswordResetLink(username);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('change-password')
    async changePassword(
        @Request() req: any,
        @Body() body: { password: string },
        @AuthUser() user: IUserJwt,
    ) {
        const { password } = body;
        const jwtExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
        const token = jwtExtractor(req);
        return this.authService.changePassword(password, user, token);
    }
}
