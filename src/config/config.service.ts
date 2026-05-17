import { Injectable } from '@nestjs/common';
import * as nodeConfig from 'config';
import { IAppConfig } from './interfaces/app-config.interface';

// tslint:disable-next-line: no-var-requires
const packageJson = require('../../package.json');

@Injectable()
export class ConfigService {
    public readonly config: IAppConfig;
    public readonly appName: string;
    public readonly appVersion: string;

    constructor() {
        this.config = nodeConfig.get('app');
        this.appName = packageJson.name;
        this.appVersion = packageJson.version;
    }
}
