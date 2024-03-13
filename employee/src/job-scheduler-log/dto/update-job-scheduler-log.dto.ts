import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import {
  JobSchedulerLogStatusEnum,
  JobSchedulerLogTypeEnum
} from '../../enum/job-scheduler-log.enum';

export class UpdateJobSchedulerLogDto {
  @IsString()
  @IsNotEmpty()
  lastStartTime: Date;

  @IsString()
  @IsNotEmpty()
  lastEndTime: Date;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(JobSchedulerLogStatusEnum))
  lastStatus: JobSchedulerLogStatusEnum;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(JobSchedulerLogTypeEnum))
  runningType: JobSchedulerLogTypeEnum;
}
