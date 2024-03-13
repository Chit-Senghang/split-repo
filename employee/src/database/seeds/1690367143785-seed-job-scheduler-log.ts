import { MigrationInterface, QueryRunner } from 'typeorm';
import { jobSchedulerLogsData } from '../data/job-scheduler-log';

export class SeedJobSchedulerLog1690367143785 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const jobSchedulerLogData of jobSchedulerLogsData) {
      await queryRunner.manager.query(`
        INSERT INTO job_scheduler_log (
            name,
            last_start_time, 
            last_end_time, 
            last_status, 
            running_type
          )
        VALUES
          (
            '${jobSchedulerLogData.name}',
            '${jobSchedulerLogData.lastStartTime}', 
            '${jobSchedulerLogData.lastEndTime}', 
            '${jobSchedulerLogData.lastStatus}', 
            '${jobSchedulerLogData.runningType}'
          );
    `);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
