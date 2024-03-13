import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableWorkingShift1686882650325 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE working_shift
    ALTER COLUMN "weekend_scan_time" TYPE time;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
