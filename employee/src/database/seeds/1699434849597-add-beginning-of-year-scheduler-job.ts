import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  JobSchedulerLogNameEnum,
  JobSchedulerLogStatusEnum,
  JobSchedulerLogTypeEnum
} from '../../enum/job-scheduler-log.enum';
import { DEFAULT_DATE_TIME_FORMAT } from '../../shared-resources/common/dto/default-date-format';
import { dayJs } from '../../shared-resources/common/utils/date-utils';

export class AddBeginningOfYearSchedulerJob1699434849597
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
        INSERT INTO
            job_scheduler_log (
            name, 
            last_start_time, 
            last_end_time, 
            last_status, 
            running_type,
            description
        )
        VALUES
        (
            '${JobSchedulerLogNameEnum.BEGINNING_OF_YEAR}',
            '${dayJs().format(DEFAULT_DATE_TIME_FORMAT)}',
            '${dayJs().format(DEFAULT_DATE_TIME_FORMAT)}',
            '${JobSchedulerLogStatusEnum.SUCCEED}',
            '${JobSchedulerLogTypeEnum.AUTO}',
            'Run every day at 12:00 AM to generate leave stock at the beginning of every year.'
        );
    `);

    await queryRunner.query(`
        DELETE FROM job_scheduler_log
        WHERE name = '${JobSchedulerLogNameEnum.GENERATE_LEAVE_STOCK}'
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
