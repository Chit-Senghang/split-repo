import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPayrollTable1688721437958 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        TRUNCATE TABLE payroll_report_detail, payroll_report,payroll_by_store,payroll_master;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
