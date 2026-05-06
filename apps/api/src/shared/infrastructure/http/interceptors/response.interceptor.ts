import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Interceptor de resposta — envolve todos os resultados em envelope padrão
 * { success: true, data: T, timestamp: string }
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data: T) => ({
        success: true as const,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
