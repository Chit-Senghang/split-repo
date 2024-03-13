import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAttendanceReport1688725222745 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE attendance_report
        ADD COLUMN payback_duration DECIMAL(4,2),
        ADD COLUMN payback BOOLEAN DEFAULT false,
        ADD COLUMN mission_duration DECIMAL(4,2);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
