import 'dotenv/config';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { NestFactory } from '@nestjs/core';
import { CrudConfigService } from '@nestjsx/crud';
import * as helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { useAPIDocs } from './api-docs';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { PayloadLoggingInterceptor } from './interceptors/payload-logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { TimingInterceptor } from './interceptors/timing.interceptor';

CrudConfigService.load({
    query: {
        limit: 25,
        maxLimit: 200,
        cache: 2000,
        alwaysPaginate: true,
    },
});

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

    logger.warn(
        `${configService.appName} ${configService.appVersion} started`,
        'Main',
    );

    app.useLogger(logger);

    app.enableCors({
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: '*',
        exposedHeaders: '*',
        credentials: false,
    });

    app.use(
        helmet({
            crossOriginResourcePolicy: false,
        }),
    );
    app.useGlobalInterceptors(
        app.get(TimingInterceptor),
        app.get(TimeoutInterceptor),
        app.get(PayloadLoggingInterceptor),
        app.get(AuditInterceptor),
    );

    app.useGlobalFilters(app.get(HttpExceptionFilter));

    useAPIDocs(app);

    await app.listen(configService.config.port);
}
bootstrap();
