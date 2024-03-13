export enum JobSchedulerLogNameEnum {
  GENERATE_WORKING_SHIFT = 'GENERATE_WORKING_SHIFT',
  GENERATE_ATTENDANCE_REPORT = 'GENERATE_ATTENDANCE_REPORT',
  GENERATE_POST_PROBATION = 'GENERATE_POST_PROBATION',
  FETCH_ATTENDANCE_RECORD = 'FETCH_ATTENDANCE_RECORD',
  GENERATE_LEAVE_STOCK = 'GENERATE_LEAVE_STOCK',
  BEGINNING_OF_YEAR = 'BEGINNING_OF_YEAR',
  BEGINNING_OF_THE_DAY = 'BEGINNING_OF_THE_DAY'
}

export enum JobSchedulerLogStatusEnum {
  RUNNING = 'RUNNING',
  SUCCEED = 'SUCCEED',
  FAILED = 'FAILED'
}

export enum JobSchedulerLogTypeEnum {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
  USER_INPUT = 'USER_INPUT'
}

export enum CurrencyEnum {
  CASH = 'CASH'
}