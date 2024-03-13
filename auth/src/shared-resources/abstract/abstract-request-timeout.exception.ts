import { HttpStatus } from '@nestjs/common';
import { HttpMessage } from '../ts/enum/http-message.enum';
import { RequestTimeoutExceptionMessage } from '../ts/interface/exception.message';
import { BaseCustomException } from './abstract-base.exception';

export abstract class AbstractRequestTimeoutException extends BaseCustomException {
  constructor(private readonly resource: string) {
    super(HttpMessage.REQUEST_TIMEOUT, HttpStatus.REQUEST_TIMEOUT);
  }

  getError(): RequestTimeoutExceptionMessage[] {
    const exceptionMessage = [];
    exceptionMessage.push({
      message: `resource ${this.resource} timeout`
    });
    return exceptionMessage;
  }
}
