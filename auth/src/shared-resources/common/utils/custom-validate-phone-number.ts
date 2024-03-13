import { BadRequestException } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class PhoneValidator implements ValidatorConstraintInterface {
  private phone: any;

  validate(phone: string) {
    // {8,9} limit min and max of phone number
    this.phone = phone;
    const regex = /^\+?(?:[0-9] ?){8,9}[0-9]$/;
    return regex.test(phone);
  }

  defaultMessage() {
    return `${this.phone} Invalid phone number`;
  }
}

@ValidatorConstraint({ async: false })
export class ValidatorStringAndObject implements ValidatorConstraintInterface {
  private value: any;

  validate(value: any) {
    this.value = value;
    if (typeof value !== 'object' && typeof value !== 'string') {
      throw new BadRequestException(`${this.value} should be string or object`);
    }
    return value;
  }

  defaultMessage() {
    return `${this.value} should be string or object`;
  }
}
