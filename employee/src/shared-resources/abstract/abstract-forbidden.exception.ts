import { HttpStatus } from '@nestjs/common';
import { HttpMessage } from '../ts/enum/http-message.enum';
import { ForbiddenExceptionMessage } from '../ts/interface/exception.message';
import { BaseCustomException } from './abstract-base.exception';

export abstract class AbstractForbiddenException extends BaseCustomException {
  constructor(
    private path: string,
    private msg: string
  ) {
    super(HttpMessage.FORBIDDEN, HttpStatus.FORBIDDEN);
  }

  getError(): ForbiddenExceptionMessage[] {
    const exceptionMessage = [];
    if (this.path && this.msg) {
      exceptionMessage.push({
        path: `${this.path}`,
        message: `${this.msg}`
      });
    } else if (this.path) {
      exceptionMessage.push({
        message: `${this.path}`
      });
    } else {
      exceptionMessage.push({
        message: HttpMessage.FORBIDDEN
      });
    }
    return exceptionMessage;
  }
}
