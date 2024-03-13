import { IsIn } from 'class-validator';
import { JobSchedulerLogNameEnum } from '../../enum/job-scheduler-log.enum';

export class QueryJobSchedulerLogDto {
  @IsIn(Object.values(JobSchedulerLogNameEnum))
  jobSchedulerLogName: string;
}
