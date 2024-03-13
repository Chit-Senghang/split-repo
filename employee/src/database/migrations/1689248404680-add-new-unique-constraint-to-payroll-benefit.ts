import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewUniqueConstraintToPayrollBenefit1689248404680
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "payroll_benefit" ADD CONSTRAINT "uk_salary_component_id_employee_id_type" UNIQUE ("type","employee_id","salary_component_id");
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
