import { AbstractBadRequestException } from '../abstract';

export class InvalidParamException extends AbstractBadRequestException {
  constructor(path: string, msg: string) {
    super(path, msg);
  }
}
