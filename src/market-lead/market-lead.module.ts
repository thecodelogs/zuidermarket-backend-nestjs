import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { MarketLeadController } from './market-lead.controller';

@Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt' }), UserModule],
    controllers: [MarketLeadController],
})
export class MarketLeadModule {}
