import { AbstractTooManyRequestException } from '../abstract/abstract-too-many-request.exception';

export class ResourceTooManyRequestException extends AbstractTooManyRequestException {
  constructor(msg: string) {
    super(msg);
  }
}
