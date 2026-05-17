import { StaffMessage } from './staff-message.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffMessageController } from './staff-message.controller';
import { StaffMessageService } from './staff-message.service';
import { MailModule } from 'src/mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([StaffMessage]),
        MailModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule,
    ],
    controllers: [StaffMessageController],
    providers: [StaffMessageService],
})
export class StaffMessageModule {}
