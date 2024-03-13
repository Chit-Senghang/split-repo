import { DEFAULT_DATE_FORMAT } from '../shared-resources/common/dto/default-date-format';
import { dayJs } from '../shared-resources/common/utils/date-utils';

export interface CustomValidateDateWithTimeZoneInterface {
  timeZone: string;
  format: string;
}

export const customValidateDateWithTimeZone = (
  option: Partial<CustomValidateDateWithTimeZoneInterface>
) =>
  dayJs(option.timeZone).format(
    option.format ? option.format : DEFAULT_DATE_FORMAT
  );
