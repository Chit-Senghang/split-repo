import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobSchedulerLog1690367032519 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
      CREATE TABLE job_scheduler_log(
          id SERIAL NOT NULL,
          name VARCHAR(255) NOT NULL,
          last_start_time TIMESTAMP,
          last_end_time TIMESTAMP,
          last_status  VARCHAR(255) NOT NULL,
          running_type VARCHAR(255) NOT NULL,
          CONSTRAINT "fk_job_scheduler_log_id" PRIMARY KEY ("id")
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
