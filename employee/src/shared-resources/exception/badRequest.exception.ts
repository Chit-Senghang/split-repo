import { AbstractBadRequestException } from '../abstract';

export class ResourceBadRequestException extends AbstractBadRequestException {
  constructor(path: string, msg?: string | number) {
    super(path, msg);
  }
}
