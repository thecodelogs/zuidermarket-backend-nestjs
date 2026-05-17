import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MollieService } from './../mollie/mollie.service';
import { TeamModule } from './../team/team.module';
import { ConfigModule } from './../config/config.module';
import { UserModule } from 'src/user/user.module';
import { MailModule } from './../mail/mail.module';
import { Module } from '@nestjs/common';
import { NewUserController } from './new-user.controller';
import { NewUserService } from './new-user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';

@Module({
    imports: [
        MailModule,
        UserModule,
        ConfigModule,
        TeamModule,
        UserModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => ({
                secret: configService.config.jwt.accessToken.secret,
                signOptions: {
                    expiresIn: configService.config.jwt.accessToken.expiresIn,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [NewUserController],
    providers: [NewUserService, MollieService],
})
export class NewUserModule {}
