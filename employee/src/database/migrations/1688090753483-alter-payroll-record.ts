import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPayrollRecord1688090753483 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table payroll_report 
        add column basic_salary2 decimal,
        add column prorate_per_day decimal,
        add column seniority decimal,
        add column total_monthly decimal,
        add column total_monthly_round decimal,
        add column pension_fund decimal,
        add column total_exclude_pension decimal,
        add column total_tax decimal,
        add column non_tax_seniority decimal,
        add column net_total decimal;    
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
