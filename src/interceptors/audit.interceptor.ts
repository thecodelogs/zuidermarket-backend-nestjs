import { Request } from 'express';
import { AuditLogLine } from './../audit-log/audit-log.entity';
import { AuditLogService } from './../audit-log/audit-log.service';
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private logger = new Logger(this.constructor.name);

    constructor(private auditLogService: AuditLogService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const resource = request.url;
        const user = this.getUser(request);
        if (!user) {
            return next.handle();
        }
        const { email, userId, roles } = user;
        const action = request.method;
        const body = `User ${email} [id: ${userId}, roles: ${roles.join(
            '|',
        )}] did ${action} on ${resource}`;
        const auditLogLine = new AuditLogLine();
        auditLogLine.body = body;
        auditLogLine.resource = resource;
        auditLogLine.action = action;
        auditLogLine.email = email;
        auditLogLine.userId = userId;
        auditLogLine.roles = roles;

        this.logger.log(body);
        this.auditLogService.log(auditLogLine);

        return next.handle();
    }

    private getUser(request: Request) {
        const user = (request as any).user;
        if (!user) {
            return;
        }
        const userId = user.id;
        const email = user.email;
        const roles = user.roles;
        return { email, userId, roles };
    }
}
