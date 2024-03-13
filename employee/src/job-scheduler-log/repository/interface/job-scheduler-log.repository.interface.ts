import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { JobSchedulerLog } from '../../entities/job-scheduler-log.entity';

export interface IJobSchedulerLogRepository
  extends IRepositoryBase<JobSchedulerLog> {}
