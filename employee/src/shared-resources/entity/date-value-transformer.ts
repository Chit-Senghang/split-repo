import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';
import { convertDateTimeToGivenFormat } from '../common/utils/date-utils';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_TIME_FORMAT
} from '../common/dto/default-date-format';

export class DateTimeTransformer implements ValueTransformer {
  from(value: string): string {
    if (value) {
      return convertDateTimeToGivenFormat(value, DEFAULT_DATE_TIME_FORMAT);
    }
    return value;
  }

  to(value: string): string {
    return value;
  }
}

export class DateTransformer implements ValueTransformer {
  from(value: string): string {
    if (value) {
      return convertDateTimeToGivenFormat(value, DEFAULT_DATE_FORMAT);
    }
    return value;
  }

  to(value: string): string {
    return value;
  }
}
