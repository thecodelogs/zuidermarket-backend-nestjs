import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogLine } from './audit-log.entity';
import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([AuditLogLine]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    exports: [AuditLogService],
    providers: [AuditLogService],
    controllers: [AuditLogController],
})
export class AuditLogModule {}
