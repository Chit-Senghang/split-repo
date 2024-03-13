import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_OFFSET
} from '../../ts/constants/pagination.constants';
import { RequestMethodEnums } from '../../ts/enum/request-method.enum';
import { ResourceInternalServerError } from '../../exception/internal-server-error.exception';
import {
  Response,
  PaginationResponse,
  isPaginationResponse,
  PageMeta,
  ResponseData
} from '../../ts/interface/response.interface';

@Injectable()
export class ResponseMappingInterceptor<T extends ResponseData>
  implements NestInterceptor<T, Response>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response> {
    const Request: Request = context.switchToHttp().getRequest();
    const method = Request.method;

    const offset = Number(Request.query.offset) || DEFAULT_PAGINATION_OFFSET;
    const limit = Number(Request.query.limit) || DEFAULT_PAGINATION_LIMIT;
    const keywords = (Request.query.keywords as string) ?? '';

    return next.handle().pipe(
      map((payload: T | PaginationResponse<T>) => {
        if (isPaginationResponse(payload)) {
          const totalCount = payload.totalCount;
          const currentPage =
            offset >= totalCount ? 0 : Math.floor(offset / limit) + 1;
          const totalPage = Math.ceil(totalCount / limit);
          const lastPage = totalPage;
          const pageMeta: PageMeta = {
            keywords,
            totalCount,
            pageSize: limit,
            currentPage,
            nextPage:
              currentPage >= lastPage
                ? null
                : currentPage !== 0
                  ? currentPage + 1
                  : null,
            prevPage: currentPage <= 1 ? null : currentPage - 1,
            lastPage
          };
          const mappedData: Response = {
            data: payload.data,
            pageMeta
          };
          return mappedData;
        }
        switch (method) {
          case RequestMethodEnums.POST:
            if (Buffer.isBuffer(payload)) {
              return instanceToPlain(payload);
            } else {
              return {
                data: { id: payload.id }
              };
            }
          case RequestMethodEnums.PUT:
          case RequestMethodEnums.PATCH: {
            return {
              data: { id: payload.id }
            };
          }
          case RequestMethodEnums.GET: {
            return {
              data: instanceToPlain(payload) as T
            };
          }

          case RequestMethodEnums.DELETE: {
            return;
          }

          default:
            throw new ResourceInternalServerError(`Interceptor gone wrong!`);
        }
      })
    );
  }
}
