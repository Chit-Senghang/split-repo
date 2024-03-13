import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndexOnScanTime1695003323737 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX ik_scan_time_attendance_record ON attendance_record(scan_time);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
