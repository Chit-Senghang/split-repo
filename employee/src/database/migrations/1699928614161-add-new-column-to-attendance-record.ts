import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnToAttendanceRecord1699928614161
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE attendance_record
        ADD COLUMN is_missed_scan BOOLEAN NOT NULL DEFAULT(false);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE attendance_record
        DROP COLUMN is_missed_scan;
    `);
  }
}
