import { ExceptionMessage } from '../ts/interface/exception.message';

export abstract class BaseCustomException extends Error {
  constructor(mes: string, status: number) {
    super(mes);
    this.status = status;
  }

  readonly status: number;

  abstract getError(): ExceptionMessage[];
}
