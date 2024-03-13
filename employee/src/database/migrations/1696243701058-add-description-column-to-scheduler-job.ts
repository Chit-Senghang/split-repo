import { MigrationInterface, QueryRunner } from 'typeorm';
import { JobSchedulerLogNameEnum } from './../../enum/job-scheduler-log.enum';

export class AddDescriptionColumnToSchedulerJob1696243701058
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // alter job scheduler log add new column description
    await queryRunner.manager.query(`
        ALTER TABLE job_scheduler_log 
        ADD COLUMN description VARCHAR(255);
    `);

    // update data description use switch case
    await queryRunner.manager.query(`
      UPDATE job_scheduler_log
      SET description = CASE
          WHEN name = '${JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT}' THEN 'Running every hour from 6 AM to 11:59 PM to generate employee working schedule record'
          WHEN name = '${JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT}' THEN 'Running every day at 10 PM to generate attendance report'
          WHEN name = '${JobSchedulerLogNameEnum.GENERATE_POST_PROBATION}' THEN 'Running every day at 11 PM to update employee that passes in post-probation'
          WHEN name = '${JobSchedulerLogNameEnum.FETCH_ATTENDANCE_RECORD}' THEN 'Running fetches user attendance from fingerprints'
          WHEN name = '${JobSchedulerLogNameEnum.GENERATE_LEAVE_STOCK}' THEN 'Running every year to generate leave stock'
          ELSE description
        END
      WHERE name IN (
          '${JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT}',
          '${JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT}',
          '${JobSchedulerLogNameEnum.GENERATE_POST_PROBATION}',
          '${JobSchedulerLogNameEnum.FETCH_ATTENDANCE_RECORD}',
          '${JobSchedulerLogNameEnum.GENERATE_LEAVE_STOCK}'
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
