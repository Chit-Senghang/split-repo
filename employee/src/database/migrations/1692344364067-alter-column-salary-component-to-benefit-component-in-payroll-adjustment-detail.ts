import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterColumnSalaryComponentToBenefitComponentInPayrollAdjustmentDetail1692344364067
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
        ALTER TABLE payroll_benefit_adjustment_detail 
        RENAME COLUMN salary_component_id TO benefit_component_id;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
