import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetReasonColumnToNullable1698895429151
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE employee_warning
        ALTER COLUMN reason DROP NOT NULL;

        ALTER TABLE employee_movement
        ALTER COLUMN reason DROP NOT NULL;

        ALTER TABLE employee_resignation
        ALTER COLUMN reason DROP NOT NULL;

        ALTER TABLE missed_scan_request
        ALTER COLUMN reason DROP NOT NULL;

        ALTER TABLE mission_request
        ALTER COLUMN reason DROP NOT NULL;

        ALTER TABLE overtime_request
        ALTER COLUMN reason DROP NOT NULL;

        ALTER TABLE leave_request
        ALTER COLUMN reason DROP NOT NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
