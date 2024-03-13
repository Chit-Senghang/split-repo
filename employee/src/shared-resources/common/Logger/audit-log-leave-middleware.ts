import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
// import { GrpcService } from '../../../leave/src/grpc/grpc.service';
import { getCurrentUserFromContext } from '../../utils/get-user-from-current-context.common';

@Injectable()
export class AuditLogLeaveMiddleware implements NestMiddleware {
  constructor(private readonly grpcService: any) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime: number = Date.now();
    res.on('close', async () => {
      const { ip, method, url, body } = req;
      const { statusCode } = res;
      const totalTime: number = Date.now() - startTime;
      const requestBody: string = JSON.stringify(body);
      let maskBody = requestBody;

      const maskFields = ['token', 'refreshToken', 'password', 'accessToken'];
      for (const field of maskFields) {
        const regex = new RegExp(
          field + '":[\\s\\t\\n]*[\\"\'][^\\"\']+[\\"\']'
        );
        maskBody = maskBody.replace(regex, `${field}` + '":"*****"');
      }
      if (method !== 'GET') {
        await this.grpcService.createAuditLogging({
          requestJson: maskBody,
          requestMethod: method,
          requestUrl: url,
          ipAddress: ip,
          createdBy: getCurrentUserFromContext()
        });
      }

      Logger.log(
        method === 'GET'
          ? `[ ipAddress=${ip}, method=${method}, url=${url}, status=${statusCode}, totalTime=${totalTime}ms ]`
          : `[ ipAddress=${ip}, method=${method}, url=${url}, status=${statusCode}, payload=${maskBody}, totalTime=${totalTime}ms ]`
      );
    });
    next();
  }
}
