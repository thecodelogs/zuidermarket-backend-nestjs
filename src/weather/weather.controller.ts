import {
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
    CacheInterceptor,
    CacheTTL,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard())
@Controller('weather')
export class WeatherController {
    constructor(private weatherService: WeatherService) {}

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(6000)
    @Get()
    getCurrentWeather() {
        return this.weatherService.getCurrent();
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(3600)
    @Get('5-day')
    getWeatherForecast() {
        return this.weatherService.getForecast();
    }
}
