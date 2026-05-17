import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { MollieController } from './mollie.controller';
import { MollieService } from 'src/mollie/mollie.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [UserModule, MailModule, UserModule],
    controllers: [MollieController],
    providers: [MollieService],
    exports: [MollieService],
})
export class MollieModule {}
