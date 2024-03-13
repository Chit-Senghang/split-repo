import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableMissedScanRequest1695003749302
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE missed_scan_request
        DROP COLUMN start_scan_time_part_one,
        DROP COLUMN end_scan_time_part_one,
        DROP COLUMN start_scan_time_part_two,
        DROP COLUMN end_scan_time_part_two,
        ADD COLUMN scan_time timestamp;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
