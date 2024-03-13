import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { JobSchedulerLog } from '../entities/job-scheduler-log.entity';
import { IJobSchedulerLogRepository } from './interface/job-scheduler-log.repository.interface';

@Injectable()
export class JobSchedulerLogRepository
  extends RepositoryBase<JobSchedulerLog>
  implements IJobSchedulerLogRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(JobSchedulerLog));
  }
}
