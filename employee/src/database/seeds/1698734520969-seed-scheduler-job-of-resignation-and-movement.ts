import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  JobSchedulerLogStatusEnum,
  JobSchedulerLogTypeEnum
} from '../../enum/job-scheduler-log.enum';
import { DEFAULT_DATE_TIME_FORMAT } from '../../shared-resources/common/dto/default-date-format';
import { dayJs } from '../../shared-resources/common/utils/date-utils';

export class SeedSchedulerJobOfResignationAndMovement1698734520969
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
            'BOD',
            '${dayJs().format(DEFAULT_DATE_TIME_FORMAT)}',
            '${dayJs().format(DEFAULT_DATE_TIME_FORMAT)}',
            '${JobSchedulerLogStatusEnum.SUCCEED}',
            '${JobSchedulerLogTypeEnum.AUTO}',
            'Run every day at 12:00 AM to update employee movement and resignation.'
        );
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
