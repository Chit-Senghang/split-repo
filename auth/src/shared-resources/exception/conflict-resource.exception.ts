import { AbstractConflictResourceException } from '../abstract';

export class ResourceConflictException extends AbstractConflictResourceException {
  constructor(path: string, msg?: string) {
    super(path, msg ? msg : 'Data already exist.');
  }
}
