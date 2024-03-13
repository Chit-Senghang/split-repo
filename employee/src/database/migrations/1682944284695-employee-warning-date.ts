import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmployeeWarningDate1682944284695 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee_warning"
        ADD COLUMN "warning_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
