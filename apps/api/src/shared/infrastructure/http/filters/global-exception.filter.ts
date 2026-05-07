import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { DomainError } from '../../../domain/errors/domain-errors';

interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<{ url: string }>();

    let statusCode: number;
    let code: string;
    let message: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      code = exception.constructor.name.replace('Exception', '').toUpperCase();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message: string }).message ?? exception.message;
    } else if (exception instanceof DomainError) {
      // DomainErrors não devem chegar aqui — são tratados nos controllers
      // mas como fallback:
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      code = (exception as DomainError).code;
      message = (exception as DomainError).message;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_SERVER_ERROR';
      message = 'An unexpected error occurred.';
      if (exception instanceof Error) {
        this.logger.error('Unhandled exception', exception.message, exception.stack);
      } else {
        this.logger.error('Unhandled non-Error exception', String(exception));
      }
    }

    const response: ErrorResponse = {
      statusCode,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    reply.status(statusCode).send(response);
  }
}
