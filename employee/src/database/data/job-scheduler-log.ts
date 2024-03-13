import { dayJs } from '../../shared-resources/common/utils/date-utils';
import {
  JobSchedulerLogNameEnum,
  JobSchedulerLogStatusEnum,
  JobSchedulerLogTypeEnum
} from '../../enum/job-scheduler-log.enum';
import { DEFAULT_DATE_TIME_FORMAT } from './../../shared-resources/common/dto/default-date-format';

export const jobSchedulerLogsData = [
  {
    name: JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT,
    lastStartTime: dayJs().format(DEFAULT_DATE_TIME_FORMAT),
    lastEndTime: dayJs().format(DEFAULT_DATE_TIME_FORMAT),
    lastStatus: JobSchedulerLogStatusEnum.SUCCEED,
    runningType: JobSchedulerLogTypeEnum.AUTO
  },
  {
    name: JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT,
    lastStartTime: dayJs().format(DEFAULT_DATE_TIME_FORMAT),
    lastEndTime: dayJs().format(DEFAULT_DATE_TIME_FORMAT),
    lastStatus: JobSchedulerLogStatusEnum.SUCCEED,
    runningType: JobSchedulerLogTypeEnum.AUTO
  },
  {
    name: JobSchedulerLogNameEnum.GENERATE_POST_PROBATION,
    lastStartTime: dayJs().format(DEFAULT_DATE_TIME_FORMAT),
    lastEndTime: dayJs().format(DEFAULT_DATE_TIME_FORMAT),
    lastStatus: JobSchedulerLogStatusEnum.SUCCEED,
    runningType: JobSchedulerLogTypeEnum.AUTO
  },
  {
    name: JobSchedulerLogNameEnum.FETCH_ATTENDANCE_RECORD,
    lastStartTime: dayJs().format(DEFAULT_DATE_TIME_FORMAT),
    lastEndTime: dayJs().format(DEFAULT_DATE_TIME_FORMAT),
    lastStatus: JobSchedulerLogStatusEnum.SUCCEED,
    runningType: JobSchedulerLogTypeEnum.AUTO
  }
];
