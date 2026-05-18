import 'dotenv/config';
import * as nodeConfig from 'config';
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

function logDatabaseConfig(source: string): void {
    const envDb = {
        NODE_ENV: process.env.NODE_ENV,
        DB_TYPE: process.env.DB_TYPE,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_DATABASE: process.env.DB_DATABASE,
        DB_PASSWORD_SET: Boolean(process.env.DB_PASSWORD),
    };
    const resolvedOrm = nodeConfig.get<{ host?: string }>('app.orm');

    // eslint-disable-next-line no-console
    console.log(`[${source}] process.env DB vars:`, envDb);
    // eslint-disable-next-line no-console
    console.log(`[${source}] config package app.orm.host:`, resolvedOrm?.host);
}

async function bootstrap() {
    logDatabaseConfig('bootstrap-before-nest');

    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

    logDatabaseConfig('bootstrap-after-nest');
    logger.warn(
        `DB host in use: ${configService.config.orm.host} (env DB_HOST=${process.env.DB_HOST ?? 'not set'})`,
        'Main',
    );
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
