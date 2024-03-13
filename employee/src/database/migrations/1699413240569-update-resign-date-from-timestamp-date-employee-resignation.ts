import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateResignDateFromTimestampDateEmployeeResignation1699413240569
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
     ALTER TABLE employee_resignation ALTER COLUMN resign_date TYPE DATE;
    `);

    await queryRunner.query(`
        UPDATE job_scheduler_log 
        SET "name"  = 'Beginning of the day'
        WHERE "name" = 'BOD';
    `);

    await queryRunner.query(`
        ALTER TABLE employee_movement ALTER COLUMN last_movement_date DROP NOT NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
