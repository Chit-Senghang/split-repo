import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnsToPayrollBenefitAdjustmentDetail1690260177281
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE payroll_benefit_adjustment_detail
        ADD COLUMN  "for_year" INTEGER NULL, 
        ADD COLUMN "for_month" INTEGER NULL, 
        ADD COLUMN "is_monthly" BOOLEAN NOT NULL DEFAULT(false),
        ADD COLUMN "description" VARCHAR(255) NULL
    `);

    await queryRunner.query(`
        ALTER TABLE payroll_benefit_adjustment
        DROP COLUMN adjustment_date;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
