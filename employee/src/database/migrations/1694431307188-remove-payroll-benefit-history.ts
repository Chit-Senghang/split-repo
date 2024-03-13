import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePayrollBenefitHistory1694431307188
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE payroll_benefit_history;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
