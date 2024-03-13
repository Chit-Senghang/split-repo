import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPayrollReport1688269009320 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table attendance_report 
        alter column late_scan_part_one type real,
        alter column late_scan_part_two type real,
        alter column late_scan_part_three type real,
        alter column late_scan_part_four type real;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
