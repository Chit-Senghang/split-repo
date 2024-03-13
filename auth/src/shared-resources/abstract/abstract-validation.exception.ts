import { HttpStatus } from '@nestjs/common';
import { HttpMessage } from '../ts/enum/http-message.enum';
import { ValidationErrorExceptionMessage } from '../ts/interface/exception.message';
import { BaseCustomException } from './abstract-base.exception';

export abstract class AbstractValidationErrorException extends BaseCustomException {
  constructor(
    private readonly key?: string,
    private readonly msg?: string
  ) {
    super(HttpMessage.UNPROCESSABLE_ENTITY, HttpStatus.UNPROCESSABLE_ENTITY);
  }

  getError(): ValidationErrorExceptionMessage[] {
    const error = [];
    error.push({
      path: this.key,
      message: this.msg
    });
    return error;
  }
}
