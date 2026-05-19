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
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
    logger = new Logger(this.constructor.name);

    constructor(private readonly authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @ApiBody({ type: LoginDto })
    @Post('login')
    async login(@Request() req) {
        this.logger.log(`User ${req.user.email} logged in`);
        return this.authService.login(req.user);
    }

    @Post('refresh')
    async refresh(@Body() body: RefreshTokenDto) {
        return this.authService.refresh(body.refreshToken);
    }

    @HttpCode(204)
    @Post('logout')
    async logout(@Body() body: RefreshTokenDto) {
        this.authService.logout(body.refreshToken);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('current-user')
    getProfile(@Request() req) {
        return req.user;
    }

    @Throttle(5, 60)
    @Post('send-reset-link')
    async sendPasswordResetLink(@Body() body: ResetPasswordDto) {
        const { username } = body;
        this.logger.log(`Password reset requested by ${username}`);
        return this.authService.sendPasswordResetLink(username);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post('change-password')
    async changePassword(
        @Request() req: any,
        @Body() body: ChangePasswordDto,
        @AuthUser() user: IUserJwt,
    ) {
        const { password } = body;
        const jwtExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
        const token = jwtExtractor(req);
        return this.authService.changePassword(password, user, token);
    }
}
