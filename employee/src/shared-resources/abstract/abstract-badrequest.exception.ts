import { HttpStatus } from '@nestjs/common';
import { HttpMessage } from '../ts/enum/http-message.enum';
import { BadRequestExceptionMessage } from '../ts/interface/exception.message';
import { BaseCustomException } from './abstract-base.exception';

export abstract class AbstractBadRequestException extends BaseCustomException {
  constructor(
    private readonly path: string,
    private readonly customMsg: string | number
  ) {
    super(HttpMessage.BAD_REQUEST, HttpStatus.BAD_REQUEST);
  }

  getError(): BadRequestExceptionMessage[] {
    const exceptionMessage = [];
    exceptionMessage.push({
      path: this.path,
      message: this.customMsg
    });
    return exceptionMessage;
  }
}
