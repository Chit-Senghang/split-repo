import { AbstractBadRequestException } from '../../shared-resources/abstract';

export class AxiosBadRequest extends AbstractBadRequestException {
  constructor(path: string, msg: string) {
    super(path, msg);
  }
}
