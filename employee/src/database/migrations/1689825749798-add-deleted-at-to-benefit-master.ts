import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToBenefitMaster1689825749798
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE payroll_benefit_master
        ADD COLUMN "deleted_at" TIMESTAMP;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
