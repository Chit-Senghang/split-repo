import { HttpStatus } from '@nestjs/common';
import { HttpMessage } from '../ts/enum/http-message.enum';
import { UnauthorizedExceptionMessage } from '../ts/interface/exception.message';
import { BaseCustomException } from './abstract-base.exception';

export abstract class AbstractUnauthorizedException extends BaseCustomException {
  constructor(private readonly msg) {
    super(HttpMessage.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
  }

  getError(): UnauthorizedExceptionMessage[] {
    const exceptionMessage = [];
    if (this.msg) {
      exceptionMessage.push({
        message: `${this.msg}`
      });
    } else {
      exceptionMessage.push({
        message: HttpMessage.UNAUTHORIZED
      });
    }
    return exceptionMessage;
  }
}
