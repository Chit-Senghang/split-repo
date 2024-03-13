import { AbstractInternalErrorException } from '../abstract';

export class ResourceInternalServerError extends AbstractInternalErrorException {
  constructor(msg: string) {
    super(msg);
  }
}
