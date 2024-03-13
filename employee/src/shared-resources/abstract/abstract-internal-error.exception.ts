import { HttpStatus } from '@nestjs/common';
import { InternalServerErrorMessage } from '../ts/interface/exception.message';
import { BaseCustomException } from './abstract-base.exception';

export abstract class AbstractInternalErrorException extends BaseCustomException {
  constructor(private readonly msg: string) {
    super(msg, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  getError(): InternalServerErrorMessage[] {
    const exceptionMessage = [];
    exceptionMessage.push({
      messsage: this.msg
    });
    return exceptionMessage;
  }
}
