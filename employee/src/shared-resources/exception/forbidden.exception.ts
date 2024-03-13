import { AbstractForbiddenException } from '../abstract';

export class ResourceForbiddenException extends AbstractForbiddenException {
  constructor(path: string, msg?: string) {
    super(path, msg);
  }
}
