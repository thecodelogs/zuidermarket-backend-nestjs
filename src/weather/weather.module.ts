import { Module, HttpModule, CacheModule } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        HttpModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        CacheModule.register(),
    ],
    controllers: [WeatherController],
    providers: [WeatherService],
})
export class WeatherModule {}
