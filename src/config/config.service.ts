import { Injectable } from '@nestjs/common';
import * as nodeConfig from 'config';
import { IAppConfig } from './interfaces/app-config.interface';

// tslint:disable-next-line: no-var-requires
import * as path from 'path';

const packageInfo = require(path.join(process.cwd(), 'package.json'));

@Injectable()
export class ConfigService {
    public readonly config: IAppConfig;
    public readonly appName: string;
    public readonly appVersion: string;

    constructor() {
        this.config = nodeConfig.get('app');
        this.appName = packageInfo.name;
        this.appVersion = packageInfo.version;
    }
}
