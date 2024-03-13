import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableAttendanceRecord1701316796671
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE attendance_record ADD COLUMN before_adjustment timestamp NULL;`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
