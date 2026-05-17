import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class PayloadLoggingInterceptor implements NestInterceptor {
    constructor(@Inject('winston') private readonly logger: Logger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const className = context.getClass().name;
        const request = context.switchToHttp().getRequest<Request>();

        this.logger.verbose(
            `${request.method} ${request.url}, payload: {${JSON.stringify(
                request.body,
            )}}`,
            {
                context: className,
            },
        );

        return next.handle();
    }
}
