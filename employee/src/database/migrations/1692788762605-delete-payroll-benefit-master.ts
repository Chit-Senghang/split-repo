import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeletePayrollBenefitMaster1692788762605
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE payroll_benefit
        DROP CONSTRAINT fk_payroll_benefit_payroll_benefit_master_id;
        ALTER TABLE payroll_benefit
        ALTER COLUMN payroll_benefit_master_id DROP NOT NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
