import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableAttendanceReport1693559723690
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        ALTER TABLE attendance_report
        DROP COLUMN borrow,
        DROP COLUMN borrow_duration,
        DROP COLUMN payback,
        DROP COLUMN payback_duration,
        DROP COLUMN mission_duration;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
