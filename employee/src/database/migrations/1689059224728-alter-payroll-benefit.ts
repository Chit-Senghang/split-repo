import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPayrollBenefit1689059224728 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `  
            ALTER TABLE payroll_benefit
            ADD COLUMN base_salary decimal(10,2)
        `
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
