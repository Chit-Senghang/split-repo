import { FindOperator } from 'typeorm/find-options/FindOperator';

export type ReportAttendanceSummeryByScanTimeType = {
  scanTime: Date | FindOperator<Date> | string;
};
