import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as duration from 'dayjs/plugin/duration';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_TIME_FORMAT
} from '../dto/default-date-format';
import { TimeZoneEnum } from './date-time-zone.enum';

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.tz.setDefault(TimeZoneEnum.PHNOM_PENH);

const getCurrentDate = () => {
  return dayjs().utc(true);
};

const startOfMonth = (format: string) => {
  return getCurrentDate().startOf('month').format(format);
};

const endOfMonth = (format: string) => {
  return getCurrentDate().endOf('month').format(format);
};

const getCurrentYear = () => {
  return getCurrentDate().year();
};

function convertUtcToLocalTime(date: Date): Date {
  return dayjs(date).add(7, 'hour').toDate();
}

function getCurrentDateTime() {
  return dayjs().utc(true).format(DEFAULT_DATE_TIME_FORMAT);
}

function getCurrentDateWithFormat() {
  return dayjs().utc(true).format(DEFAULT_DATE_FORMAT);
}

// Get the first day of the current month in UTC: (example: 2020-11-01)
const firstDayOfCurrentMonth = () => {
  return dayjs().utc(true).startOf('month').format(DEFAULT_DATE_FORMAT);
};
function convertDateTimeToGivenFormat(date: string | Date, format: string) {
  return dayjs(date).utc(true).format(format);
}

function convertDateTimeToGivenFormatWithNull(
  date: string | Date
): string | null {
  const result: string = dayjs(date).utc(true).format(DEFAULT_DATE_FORMAT);
  if (result === 'Invalid Date') {
    return null;
  } else {
    return result;
  }
}

function convertMinuteToHour(minute: number): number {
  return Number((minute / 60).toFixed(2));
}

function formatMinuteToHHmm(minuteDuration: number): string {
  return `${Math.floor(minuteDuration / 60)}:${(minuteDuration % 60)
    .toString()
    .padStart(2, '0')}`;
}

function isSaturday(date: Date | string): boolean {
  return dayjs(date).day() === 6;
}

function isSunday(date: Date | string): boolean {
  return dayjs(date).day() === 0;
}

function getStartOfDate(date?: Date | string): Date {
  return dayjs(date).startOf('day').toDate();
}

function getEndOfDate(date?: Date | string): Date {
  return dayjs(date).endOf('day').toDate();
}

export {
  getCurrentDate,
  dayjs as dayJs,
  convertUtcToLocalTime,
  getCurrentDateTime,
  getCurrentDateWithFormat,
  convertDateTimeToGivenFormat,
  convertDateTimeToGivenFormatWithNull,
  startOfMonth,
  endOfMonth,
  convertMinuteToHour,
  formatMinuteToHHmm,
  isSaturday,
  isSunday,
  getStartOfDate,
  getEndOfDate,
  firstDayOfCurrentMonth,
  getCurrentYear
};
