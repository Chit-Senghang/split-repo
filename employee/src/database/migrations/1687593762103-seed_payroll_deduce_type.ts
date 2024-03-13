import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPayrollDeduceType1687593762103 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        ALTER TABLE payroll_deduction_type ADD COLUMN is_system_defined bool NOT NULL DEFAULT false;
        INSERT INTO payroll_deduction_type(name, is_system_defined)
        VALUES('Attendance Deduction', true), ('Leave Deduction', true), ('Loan Deduction', true), ('Other Deduction', true);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
