import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
    logger = new Logger(this.constructor.name);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();
        const className = context.getClass().name;
        const functionName = context.getHandler().name;
        const request = context.switchToHttp().getRequest<Request>();

        this.logger.log(`${request.method} ${request.url}`);

        return next
            .handle()
            .pipe(
                tap(() =>
                    this.logTimeDifference(className, functionName, start),
                ),
            );
    }

    private logTimeDifference(
        className: string,
        functionName: string,
        start: number,
    ) {
        const end = Date.now();
        this.logger.log(`${className}.${functionName} took ${end - start} ms`);
    }
}
