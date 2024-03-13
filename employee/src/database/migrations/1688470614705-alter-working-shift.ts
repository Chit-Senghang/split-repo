import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterWorkingShift1688470614705 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table working_shift 
        add column allow_late_scan_in integer not null default 0,
        add column allow_late_scan_out integer not null default 0;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
