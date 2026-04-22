import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestTimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const type = context.getType<string>();
    const http = this.getHttpContext(context, type);
    const label = this.getLabel(http.request, type);

    return next.handle().pipe(
      map((data: unknown) => {
        const elapsed = Date.now() - startedAt;

        if (http.response && !http.response.headersSent) {
          http.response.setHeader('X-Elapsed-Time', `${elapsed}ms`);
        }

        this.logger.log(`${label} ${elapsed}ms`);

        if (this.shouldAttachToView(http.request, type, data)) {
          return {
            ...(data as Record<string, unknown>),
            serverElapsedTime: elapsed,
          };
        }

        return data;
      }),
    );
  }

  private getHttpContext(context: ExecutionContext, type: string) {
    if (type === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context).getContext<{
        req?: Request;
        res?: Response;
      }>();

      return {
        request: gqlContext.req,
        response: gqlContext.res,
      };
    }

    const http = context.switchToHttp();

    return {
      request: http.getRequest<Request>(),
      response: http.getResponse<Response>(),
    };
  }

  private getLabel(request: Request | undefined, type: string) {
    if (!request) {
      return type;
    }

    return `${request.method} ${request.originalUrl ?? request.url}`;
  }

  private shouldAttachToView(
    request: Request | undefined,
    type: string,
    data: unknown,
  ) {
    if (
      type !== 'http' ||
      !request ||
      request.path.startsWith('/api') ||
      request.path.startsWith('/graphql') ||
      request.headers.accept?.includes('text/event-stream') ||
      typeof data !== 'object' ||
      data === null ||
      Array.isArray(data)
    ) {
      return false;
    }

    return true;
  }
}
