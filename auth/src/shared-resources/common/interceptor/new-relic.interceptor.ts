import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as newrelic from 'newrelic';

@Injectable()
export class NewrelicInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return newrelic.startWebTransaction(context.getHandler().name, () => {
      const transaction = newrelic.getTransaction();
      return next.handle().pipe(
        tap(() => {
          return transaction.end();
        })
      );
    });
  }
}
