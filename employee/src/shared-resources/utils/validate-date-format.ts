import dayjs from 'dayjs';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_HOUR_MINUTE_FORMAT,
  DEFAULT_DATE_TIME_FORMAT,
  DEFAULT_TIME_FORMAT,
  DEFAULT_YEAR_FORMAT
} from '../common/dto/default-date-format';
import { ResourceBadRequestException } from '../exception/badRequest.exception';
import { dayJs } from '../common/utils/date-utils';

const DATE_TIME = 'DateTime';

export function validateDateTime(date: any) {
  if (date) {
    isValidDate(date);
  }

  const result =
    dayJs(date, DEFAULT_DATE_FORMAT, true).format(DEFAULT_DATE_FORMAT) === date;
  if (result !== true) {
    throw new ResourceBadRequestException(
      `DateTime ${date} doesn't match the format ${DEFAULT_DATE_FORMAT}`
    );
  }
  return dayJs(date).utc(true).toDate();
}

export function fromDateToDateConverter(dateTime: any, type: string) {
  if (dateTime) {
    isValidDate(dateTime);
  }
  const result =
    dayJs(dateTime, DEFAULT_DATE_FORMAT, true).format(DEFAULT_DATE_FORMAT) ===
    dateTime;
  if (result !== true) {
    throw new ResourceBadRequestException(
      DATE_TIME,
      `DateTime ${dateTime} doesn't match the format ${DEFAULT_DATE_FORMAT}`
    );
  }
  let temp: any;

  if (type === 'fromDate') {
    temp = dateTime + 'T:00:00:00';
  } else {
    temp = dateTime + 'T:23:59:59';
  }

  return temp;
}

export const customValidateDate = (date: any) => {
  if (date) {
    isValidDate(date);
  }
  const convertDate: boolean =
    dayJs(date, DEFAULT_DATE_FORMAT, true).format(DEFAULT_DATE_FORMAT) === date;
  if (!convertDate) {
    throw new ResourceBadRequestException(
      DATE_TIME,
      `DateTime ${date} doesn't match the format ${DEFAULT_DATE_FORMAT}`
    );
  }
  return dayJs(date, DEFAULT_DATE_FORMAT, true).format(DEFAULT_DATE_FORMAT);
};

export const customValidateDateWithDash = (date: string | Date) => {
  const convertDate: boolean =
    dayJs(date, DEFAULT_DATE_TIME_FORMAT, true).format(
      DEFAULT_DATE_TIME_FORMAT
    ) === date;
  if (!convertDate) {
    throw new ResourceBadRequestException(
      DATE_TIME,
      `DateTime ${date} doesn't match the format ${DEFAULT_DATE_TIME_FORMAT}`
    );
  }
  return dayJs(date, DEFAULT_DATE_TIME_FORMAT, true).format(
    DEFAULT_DATE_TIME_FORMAT
  );
};

export const customValidationDateHourMinute = (date: string): dayjs.Dayjs => {
  const formattedDate: dayjs.Dayjs = dayJs(
    date,
    DEFAULT_DATE_HOUR_MINUTE_FORMAT,
    true
  );

  if (!formattedDate.isValid()) {
    throw new ResourceBadRequestException(
      DATE_TIME,
      `DateTime ${date} doesn't match the format ${DEFAULT_DATE_HOUR_MINUTE_FORMAT}`
    );
  }
  return formattedDate.utc(true);
};

export const customValidateTime = (time: string) => {
  const convertCurrentDate = dayJs().format(DEFAULT_DATE_FORMAT);
  const getTime: string[] = time.split(':');
  const storeTime = getTime[0];
  const storeMinute = getTime[1];
  const defaultFormatTime = DEFAULT_TIME_FORMAT;
  // eslint-disable-next-line prettier/prettier
  const formatTime = dayJs(
    `${convertCurrentDate} ${storeTime}:${storeMinute}`
  ).format(DEFAULT_TIME_FORMAT);
  if (formatTime !== time) {
    throw new ResourceBadRequestException(
      `Time`,
      `${time} doesn't match the format ${defaultFormatTime}`
    );
  }
  return formatTime;
};

export const checkIsValidYearFormat = (data: any, format?: string) => {
  const year: boolean =
    dayJs(data, format ?? DEFAULT_YEAR_FORMAT).format(
      format ?? DEFAULT_YEAR_FORMAT
    ) === data;

  if (year === false) {
    throw new ResourceBadRequestException(
      `Data`,
      `${data} doesn't match the format ${format ?? DEFAULT_YEAR_FORMAT}`
    );
  }
};

export const checkOnlyMonth = (month: any) => {
  if (month > 12) {
    throw new ResourceBadRequestException(
      'month',
      'Valid month is not greater than 12'
    );
  }
};

export const isValidDate = (date: Date | string): string => {
  const formattedDate = dayJs(date).format(DEFAULT_DATE_FORMAT);
  const invalidate = dayJs(date, DEFAULT_DATE_FORMAT, true).format(
    formattedDate
  );
  const newDate = new Date(invalidate);
  if (isNaN(newDate.getTime())) {
    throw new ResourceBadRequestException(`${date} Invalid Date`);
  }

  return invalidate;
};

export const validateDateTimeFormat = (
  date: string | Date,
  format?: string
) => {
  const dateTime: string = dayJs(
    date,
    format ?? DEFAULT_DATE_TIME_FORMAT,
    true
  ).format(format ?? DEFAULT_DATE_TIME_FORMAT);

  if (dateTime === 'Invalid Date') {
    throw new ResourceBadRequestException(
      'DateTime does not match default format',
      DEFAULT_DATE_TIME_FORMAT
    );
  }

  return dateTime;
};

export const validateTimeWithFormat = (time: string, timeFormat?: string) => {
  const dateTime: any = dayJs(
    `${dayJs().format(DEFAULT_DATE_FORMAT)} ${time}`,
    `${DEFAULT_DATE_FORMAT} ${timeFormat ?? DEFAULT_TIME_FORMAT}`,
    true
  ).format(timeFormat);

  if (dateTime === 'Invalid Date') {
    throw new ResourceBadRequestException(
      'Time is not match with format',
      timeFormat
    );
  }

  return dateTime;
};

type FromDateToDate = {
  date?: any;
  type?: dayJs.OpUnitType;
  dateRange?: DateRange;
};

type DateRange = {
  fromDate: Date | string;
  toDate: Date | string;
};

export const convertDateRangeToFromDateToDate = (args?: FromDateToDate) => {
  if (!args || args.type) {
    const fromDate = dayJs()
      .startOf(args.date ? args.type : 'day')
      .utc(true)
      .startOf('day')
      .format(DEFAULT_DATE_TIME_FORMAT);

    const toDate = dayJs()
      .endOf(args.date ? args.type : 'day')
      .utc(true)
      .endOf('day')
      .format(DEFAULT_DATE_TIME_FORMAT);

    return { fromDate, toDate };
  } else if (args.dateRange) {
    const fromDate = dayJs(args.dateRange.fromDate)
      .utc(true)
      .startOf('day')
      .format(DEFAULT_DATE_TIME_FORMAT);
    const toDate = dayJs(args.dateRange.toDate)
      .utc(true)
      .endOf('day')
      .format(DEFAULT_DATE_TIME_FORMAT);

    return { fromDate, toDate };
  } else {
    const fromDate = dayJs(args.date).utc(true).startOf('day').toDate();
    const toDate = dayJs(args.date).utc(true).endOf('day').toDate();

    return { fromDate, toDate };
  }
};
