import { AbstractUnauthorizedException } from '../abstract';

export class UnauthorizedResourceException extends AbstractUnauthorizedException {
  constructor(msg?: string) {
    super(msg);
  }
}
