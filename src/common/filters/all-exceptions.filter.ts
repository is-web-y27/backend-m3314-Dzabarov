import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType<string>() !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = this.getStatus(exception);
    const payload = this.getPayload(exception, status, request.url);

    if (request.path.startsWith('/api')) {
      response.status(status).json(payload);
      return;
    }

    response.status(status).render('error', {
      title: `Ошибка ${status}`,
      statusCode: status,
      message: payload.message,
    });
  }

  private getStatus(exception: unknown) {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof QueryFailedError) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getPayload(exception: unknown, status: number, path: string) {
    if (exception instanceof HttpException) {
      const error = exception.getResponse();

      if (typeof error === 'string') {
        return {
          statusCode: status,
          message: error,
          error: exception.name,
          path,
          timestamp: new Date().toISOString(),
        };
      }

      if (typeof error === 'object' && error !== null) {
        return {
          statusCode: status,
          path,
          timestamp: new Date().toISOString(),
          ...error,
        };
      }
    }

    if (exception instanceof QueryFailedError) {
      return {
        statusCode: status,
        message: 'Некорректные данные запроса',
        error: exception.name,
        path,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      statusCode: status,
      message: 'Внутренняя ошибка сервера',
      error: 'InternalServerError',
      path,
      timestamp: new Date().toISOString(),
    };
  }
}
