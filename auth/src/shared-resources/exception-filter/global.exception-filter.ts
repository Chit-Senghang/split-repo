import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ValidationError } from 'class-validator';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { throwError } from 'rxjs';
import { BaseCustomException } from '../abstract';
import { PostgresqlStatusCode } from '../ts/enum/postgres-status-code.enum';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor() {
    return;
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let message = 'Internal server error';
    const errors = [];
    let status = 500;
    //* Check error message from grpc
    switch (exception.code) {
      case 2: {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        errors.push({ message: exception.details });
        return response.status(status).json({
          message,
          errors
        });
      }
      case 5: {
        status = HttpStatus.NOT_FOUND;
        errors.push({ message: exception.details });
        return response.status(status).json({
          message: 'Resource not found',
          errors
        });
      }
      default:
        break;
    }

    if (exception instanceof BaseCustomException) {
      message = exception.message;
      status = exception.status;
      exception.getError().forEach((e) => errors.push(e));

      response.status(status).json({
        message,
        errors
      });
      return;
    }

    if (exception instanceof QueryFailedError) {
      switch (exception.driverError.code) {
        case PostgresqlStatusCode.UNIQUE_VIOLATION: {
          const customErrorMessage = customDuplicateErrorMessage(
            exception.driverError.detail,
            exception.driverError.table
          );
          errors.push(customErrorMessage);
          message = 'Resource conflict error';
          status = HttpStatus.CONFLICT;
          response.status(status).json({
            message,
            errors
          });
          return;
        }
        case PostgresqlStatusCode.INVALID_TEXT_REPRESENTATION:
          errors.push({ message: exception.message });
          response.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad Request',
            errors
          });
          return;
        case PostgresqlStatusCode.FOREIGN_KEY_VIOLATION:
          errors.push({
            message: `You cannot delete data because this record has been used by another record.`
          });
          response.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad Request',
            errors
          });
          return;
        case PostgresqlStatusCode.UNDEFINED_COLUMN:
          errors.push({ message: exception.message });
          response.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad Request',
            errors
          });
          return;
        case PostgresqlStatusCode.NOT_NULL_VIOLATION:
          errors.push({
            message: `field '${(exception as any).column}' should not be null!`
          });
          response.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad Request',
            errors
          });
          return;
      }
    }

    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }

    if (exception instanceof BadRequestException) {
      const respMsg = (exception.getResponse() as any).message;
      if (Array.isArray(respMsg) && respMsg.length >= 1) {
        const errMsg = respMsg[0];
        if (errMsg instanceof ValidationError) {
          message = 'Validation Error';
          status = exception.getStatus();
          let nestedError: unknown;
          for (const data of errMsg.children) {
            for (const temp of data.children) {
              nestedError = temp.constraints;
            }
          }
          const constrains = Object.values(errMsg.constraints || nestedError);
          constrains.forEach((constrain) =>
            errors.push({
              path: errMsg.property,
              message: constrain
            })
          );

          response.status(status).json({ message, errors });
          return;
        }
      }

      if ((exception.getResponse() as any).message) {
        message = 'Bad Request';
        status = exception.getStatus();
        errors.push({ message: exception.message });
        response.status(status).json({ message, errors });
        return;
      }
    }

    if (exception instanceof HttpException) {
      message = exception.message;
      status = exception.getStatus();

      response.status(status).json({ message, errors });
      return;
    }

    //*Postgres Error Message
    // eslint-disable-next-line no-console
    console.error(exception);
    errors.push({
      message: 'ops!, something went wrong, please connect administrator'
    });
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message,
      errors
    });
    return;
  }
}

const customDuplicateErrorMessage = (msg: string, table: string) => {
  let messageStart: any;
  if (typeof msg === 'string' && msg.includes('already exists')) {
    messageStart = table.split('_').join(' ') + ' ' + 'already exists';

    const equalSignIndex = msg
      .split(/[(,)]/g)
      .findIndex((item: any, index: number) => {
        if (item === '=') {
          return index;
        }
      });
    if (equalSignIndex > 2) {
      const splitMessage = msg.replace(/["("|")"]/g, '').split(/[\s|=]/g);
      return {
        path: splitMessage[1] + splitMessage[2],
        message: messageStart
      };
    }

    const splitMessage = msg.replace(/["("|")"]/g, '').split(/[\s|=]/g);
    return {
      path: splitMessage[1],
      message: splitMessage.slice(2).join(' ').replace('.', '')
    };
  }
};
