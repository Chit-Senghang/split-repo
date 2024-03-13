import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorConstraintPayrollBenefit1689823055158
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE payroll_benefit
        DROP CONSTRAINT uk_salary_component_id_employee_id_type
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_salary_component_id_employee_id_type" ON payroll_benefit ("salary_component_id", "employee_id", "type") WHERE (deleted_at IS NULL);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
