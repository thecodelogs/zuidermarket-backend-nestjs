import { Injectable, Logger, HttpService } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WeatherService {
    logger = new Logger(this.constructor.name);
    apiKey: string;
    private readonly apiUrl = 'https://api.openweathermap.org/data/2.5/';
    constructor(
        configService: ConfigService,
        private httpService: HttpService,
    ) {
        this.apiKey = configService.config.weather.apiKey;
    }

    getFromAPI(endpoint: string): Observable<any> {
        const params = {
            appid: this.apiKey,
            q: 'Amsterdam,nl_NL',
            lang: 'nl',
            units: 'metric',
        };
        this.logger.log('Retrieving data from Open Weathermap API...');
        return this.httpService
            .get(this.apiUrl + endpoint, { params })
            .pipe(map((res) => res.data));
    }

    getCurrent() {
        return this.getFromAPI('weather');
    }

    getForecast() {
        return this.getFromAPI('forecast');
    }
}
