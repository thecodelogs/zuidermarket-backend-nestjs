import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from './config/config.service';

export function useAPIDocs(app: INestApplication) {
    const configService = app.get(ConfigService);
    if (!configService.config.enableDocs) {
        return;
    }
    const options = new DocumentBuilder()
        .setTitle(configService.appName)
        .setDescription('ZuiderMAKKIE REST API')
        .setVersion(configService.appVersion)
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/docs', app, document);
}
