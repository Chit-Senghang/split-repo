import { Inject, Injectable } from '@nestjs/common';
import { EmployeeProto } from '../shared-resources/proto';
import { dayJs } from '../shared-resources/common/utils/date-utils';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { DEFAULT_DATE_TIME_FORMAT } from '../shared-resources/common/dto/default-date-format';
import {
  JobSchedulerLogStatusEnum,
  JobSchedulerLogTypeEnum
} from '../enum/job-scheduler-log.enum';
import { JobSchedulerLogRepository } from './repository/job-scheduler-log.repository';
import { IJobSchedulerLogRepository } from './repository/interface/job-scheduler-log.repository.interface';

@Injectable()
export class JobSchedulerLogService {
  private readonly JOB_SCHEDULER_LOG = 'job scheduler log';

  constructor(
    @Inject(JobSchedulerLogRepository)
    private readonly jobSchedulerLogRepo: IJobSchedulerLogRepository
  ) {}

  async findOne(jobSchedulerLogQueryName: string) {
    const jobSchedulerLog = await this.jobSchedulerLogRepo.findOne({
      where: {
        name: jobSchedulerLogQueryName
      }
    });

    if (!jobSchedulerLog) {
      throw new ResourceNotFoundException(this.JOB_SCHEDULER_LOG);
    }

    // return job-scheduler-log
    return jobSchedulerLog;
  }

  async startLog(jobSchedulerLog: EmployeeProto.JobSchedulerLogRequest) {
    // find job-scheduler-log by name
    const findJobSchedulerLog = await this.findOne(
      jobSchedulerLog.jobSchedulerLogName
    );

    // update start date time and status
    findJobSchedulerLog.lastStartTime = dayJs().format(
      DEFAULT_DATE_TIME_FORMAT
    );
    findJobSchedulerLog.lastStatus = JobSchedulerLogStatusEnum.RUNNING;
    findJobSchedulerLog.runningType =
      jobSchedulerLog.startType === JobSchedulerLogTypeEnum.AUTO
        ? JobSchedulerLogTypeEnum.AUTO
        : JobSchedulerLogTypeEnum.MANUAL;

    await this.jobSchedulerLogRepo.save(findJobSchedulerLog);
  }

  async endLog(jobSchedulerLog: EmployeeProto.JobSchedulerLogNameRequest) {
    // find job-scheduler-log by name
    const findJobSchedulerLog = await this.findOne(
      jobSchedulerLog.jobSchedulerLogName
    );

    // update end date time and status
    findJobSchedulerLog.lastEndTime = dayJs().format(DEFAULT_DATE_TIME_FORMAT);
    findJobSchedulerLog.lastStatus = JobSchedulerLogStatusEnum.SUCCEED;

    await this.jobSchedulerLogRepo.save(findJobSchedulerLog);
  }

  async failedLog(jobSchedulerLog: EmployeeProto.JobSchedulerLogNameRequest) {
    // find job-scheduler-log by name
    const findJobSchedulerLog = await this.findOne(
      jobSchedulerLog.jobSchedulerLogName
    );
    findJobSchedulerLog.lastEndTime = dayJs().format(DEFAULT_DATE_TIME_FORMAT);
    findJobSchedulerLog.lastStatus = JobSchedulerLogStatusEnum.FAILED;

    await this.jobSchedulerLogRepo.save(findJobSchedulerLog);
  }
}
