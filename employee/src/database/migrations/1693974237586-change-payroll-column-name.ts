import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePayrollColumnName1693974237586
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE payroll_report
        RENAME COLUMN total_tax TO salary_tax_with_held 
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
