import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPayrollDeductionToWorkflow1687591111991
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "request_work_flow_type" (version, "request_type", "description")
        VALUES(0, 'PAYROLL_DEDUCTION', 'payroll deduction');
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
