import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToPayrollBenefit1689820802973
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE payroll_benefit
        ADD COLUMN "deleted_at" TIMESTAMP;
    `);

    await queryRunner.query(`
        ALTER TABLE payroll_deduction
        ADD COLUMN "deleted_at" TIMESTAMP;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
