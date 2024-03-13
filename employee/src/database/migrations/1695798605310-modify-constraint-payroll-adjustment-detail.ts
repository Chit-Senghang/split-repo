import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyConstraintPayrollAdjustmentDetail1695798605310
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    // Drop previous constraint
    await queryRunner.query(`
        ALTER TABLE payroll_benefit_adjustment_detail
        DROP CONSTRAINT uk_payroll_adjustment_salary_component;
    `);

    //Add new constraint
    await queryRunner.query(`
        ALTER TABLE payroll_benefit_adjustment_detail
        ADD CONSTRAINT uk_payroll_benefit_adjustment_benefit_component_is_post_probation UNIQUE (payroll_benefit_adjustment_id,benefit_component_id,is_post_probation)
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
