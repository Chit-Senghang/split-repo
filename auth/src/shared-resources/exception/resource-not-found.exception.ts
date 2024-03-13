import { AbstractResourceNotFoundException } from '../abstract';

export class ResourceNotFoundException extends AbstractResourceNotFoundException {
  constructor(resource: string, msg?: string | number) {
    super(resource, msg);
  }
}
