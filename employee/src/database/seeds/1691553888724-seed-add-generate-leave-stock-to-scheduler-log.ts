import { MigrationInterface, QueryRunner } from 'typeorm';
import { dayJs } from '../../shared-resources/common/utils/date-utils';
import {
  JobSchedulerLogNameEnum,
  JobSchedulerLogStatusEnum,
  JobSchedulerLogTypeEnum
} from '../../enum/job-scheduler-log.enum';
import { DEFAULT_DATE_TIME_FORMAT } from './../../shared-resources/common/dto/default-date-format';

export class SeedAddGenerateLeaveStockToSchedulerLog1691553888724
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
        INSERT INTO
            job_scheduler_log (
            name, 
            last_start_time, 
            last_end_time, 
            last_status, 
            running_type
        )
        VALUES
        (
            '${JobSchedulerLogNameEnum.GENERATE_LEAVE_STOCK}',
            '${dayJs().format(DEFAULT_DATE_TIME_FORMAT)}',
            '${dayJs().format(DEFAULT_DATE_TIME_FORMAT)}',
            '${JobSchedulerLogStatusEnum.SUCCEED}',
            '${JobSchedulerLogTypeEnum.AUTO}'
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
