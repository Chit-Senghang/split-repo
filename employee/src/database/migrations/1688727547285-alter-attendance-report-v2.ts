import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAttendanceReportV21688727547285
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE attendance_report
        ADD COLUMN leave_allowance INTEGER;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
