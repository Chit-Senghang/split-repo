import { HttpStatus } from '@nestjs/common';
import { HttpMessage } from '../ts/enum/http-message.enum';
import { ResourceNotfoundExceptionMessage } from '../ts/interface/exception.message';
import { BaseCustomException } from './abstract-base.exception';

export abstract class AbstractResourceNotFoundException extends BaseCustomException {
  constructor(
    private resource: string,
    private custom: string | number
  ) {
    super(HttpMessage.NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  getError(): ResourceNotfoundExceptionMessage[] {
    const exceptionMessage = [];
    if (this.resource && this.custom) {
      exceptionMessage.push({
        message: `Resource ${this.resource} of ${this.custom} not found`
      });
    } else if (this.resource) {
      exceptionMessage.push({
        message: `${this.resource}`
      });
    } else {
      exceptionMessage.push({
        message: HttpMessage.NOT_FOUND
      });
    }
    return exceptionMessage;
  }
}
