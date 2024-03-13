import { MigrationInterface, QueryRunner } from 'typeorm';
import { JobSchedulerLogNameEnum } from '../../enum/job-scheduler-log.enum';

export class RenameScheduleDescription1698910120530
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE job_scheduler_log
        SET description = 'Running every day at 11 PM to generate attendance report.'
        WHERE name = '${JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT}';
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
