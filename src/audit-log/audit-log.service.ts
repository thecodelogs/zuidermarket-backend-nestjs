import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { AuditLogLine } from './audit-log.entity';

@Injectable()
export class AuditLogService extends TypeOrmCrudService<AuditLogLine> {
    logger = new Logger(this.constructor.name);
    constructor(
        @InjectRepository(AuditLogLine) repo: Repository<AuditLogLine>,
    ) {
        super(repo);
    }

    async log(line: AuditLogLine) {
        try {
            line.resource = line.resource?.slice(0, 150);
            await this.repo.save(line);
        } catch (e) {
            this.logger.error(e.message);
        }
    }
}
