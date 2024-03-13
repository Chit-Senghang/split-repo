import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnuseFieldsFromPayrollBenefit1693278783620
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE payroll_benefit
        DROP COLUMN is_monthly, 
        DROP COLUMN for_month, 
        DROP COLUMN for_year, 
        DROP COLUMN effective_date, 
        DROP COLUMN status, 
        DROP COLUMN description;

        ALTER TABLE payroll_benefit_history
        DROP COLUMN is_monthly, 
        DROP COLUMN for_month, 
        DROP COLUMN for_year, 
        DROP COLUMN effective_date, 
        DROP COLUMN status, 
        DROP COLUMN description;

        ALTER TABLE payroll_benefit_adjustment
        DROP COLUMN effective_date;

        ALTER TABLE payroll_benefit_adjustment_detail
        DROP COLUMN is_monthly, 
        DROP COLUMN for_month, 
        DROP COLUMN for_year;
    `);

    // modify payroll benefit adjustment detail
    await queryRunner.query(`
        ALTER TABLE payroll_benefit_adjustment_detail
        ADD COLUMN effective_date_from DATE NULL,
        ADD COLUMN effective_date_to DATE NULL,
        ADD COLUMN is_post_probation BOOLEAN NOT NULL DEFAULT(false),
        ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT ('PENDING');
    `);

    //modify payroll benefit history
    await queryRunner.query(`
        ALTER TABLE payroll_benefit_history
        ADD COLUMN effective_date_from DATE NULL,
        ADD COLUMN effective_date_to DATE NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
