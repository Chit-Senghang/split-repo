import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAndAddColumnToPayrollBenefit1692764658677
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //* remove type and base salary
    await queryRunner.query(`
        ALTER TABLE payroll_benefit
        DROP COLUMN type;

        ALTER TABLE payroll_benefit
        DROP COLUMN base_salary;
    `);

    await queryRunner.query(`
        ALTER TABLE payroll_benefit_history
        DROP COLUMN type;
    `);

    //add effective date
    await queryRunner.query(`
        ALTER TABLE payroll_benefit
        ADD COLUMN effective_date DATE NULL;

        ALTER TABLE payroll_benefit_adjustment_detail
        ADD COLUMN effective_date DATE NULL;

        ALTER TABLE payroll_benefit_history
        ADD COLUMN effective_date DATE NULL;
    `);

    //seed payroll adjustment type
    await queryRunner.query(`
        INSERT INTO adjustment_type (name)
        VALUES ('Initiate'),
        ('Pass probation');
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
