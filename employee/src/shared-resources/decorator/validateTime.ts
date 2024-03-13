import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator
} from 'class-validator';
import { ResourceBadRequestException } from '../exception/badRequest.exception';

@ValidatorConstraint({ name: 'isValidTime', async: false })
export class IsValidTimeConstraint implements ValidatorConstraintInterface {
  validate(value: any, validationArguments?: ValidationArguments): boolean {
    // Use a regular expression to check if the string matches the HH:mm format
    const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    const isTimeRegex = timeRegex.test(value);

    if (!isTimeRegex) {
      throw new ResourceBadRequestException(
        validationArguments.property,
        `HH:mm format`
      );
    }

    return isTimeRegex;
  }
}

export function IsValidTime(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidTimeConstraint
    });
  };
}
