import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuditLoggingService } from 'src/audit-logging/audit-logging.service';
import { getCurrentUserFromContext } from '../../utils/get-user-from-current-context.common';

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  constructor(private readonly auditLoggingService: AuditLoggingService) {}

  private readonly ignoreRoutes = ['/login', '/refresh-token', '/logout'];

  async use(req: Request, res: Response, next: NextFunction) {
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

      if (!this.ignoreRoutes.includes(url) && getCurrentUserFromContext()) {
        if (method !== 'GET') {
          await this.auditLoggingService.create({
            requestJson: maskBody,
            requestMethod: method,
            requestUrl: url,
            ipAddress: ip,
            createdBy: getCurrentUserFromContext()
          });
        }
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
