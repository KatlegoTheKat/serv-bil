import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;
    const url = req.url;
    const body = req.body as Record<string, unknown>;
    const startTime = Date.now();

    // Mask sensitive fields if necessary in the future, for now log raw body for billing debug
    const stringifiedBody = Object.keys(body || {}).length
      ? JSON.stringify(body)
      : 'None';

    this.logger.log(`[REQ] ${method} ${url} | Payload: ${stringifiedBody}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const executionTime = Date.now() - startTime;
          this.logger.log(
            `[RES] ${method} ${url} | Status: ${res.statusCode} | Duration: ${executionTime}ms`,
          );
        },
        error: (err: unknown) => {
          const executionTime = Date.now() - startTime;
          let status = 500;
          let msg = 'Internal server error';

          if (err instanceof HttpException) {
            status = err.getStatus();
            msg = err.message;
          } else if (err instanceof Error) {
            msg = err.message;
          }

          this.logger.error(
            `[ERR] ${method} ${url} | Status: ${status} | Duration: ${executionTime}ms | Msg: ${msg}`,
          );
        },
      }),
    );
  }
}
