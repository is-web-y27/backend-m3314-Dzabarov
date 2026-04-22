import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { createHash } from 'node:crypto';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class ETagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    if (request.method !== 'GET' || !request.path.startsWith('/api')) {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap((data: unknown) => {
        const etag = this.createETag(data);
        response.setHeader('ETag', etag);

        if (this.matches(request.headers['if-none-match'], etag)) {
          response.status(HttpStatus.NOT_MODIFIED).end();
          return EMPTY;
        }

        return of(data);
      }),
    );
  }

  private createETag(data: unknown) {
    return `"${createHash('sha256')
      .update(JSON.stringify(data))
      .digest('base64url')}"`;
  }

  private matches(header: string | string[] | undefined, etag: string) {
    if (!header) {
      return false;
    }

    const values = Array.isArray(header) ? header : header.split(',');
    const normalizedETag = this.normalize(etag);

    return values.some((value) => {
      const normalizedValue = this.normalize(value);

      return normalizedValue === '*' || normalizedValue === normalizedETag;
    });
  }

  private normalize(value: string) {
    return value
      .trim()
      .replace(/^W\//, '')
      .replace(/^['"]+|['"]+$/g, '');
  }
}
