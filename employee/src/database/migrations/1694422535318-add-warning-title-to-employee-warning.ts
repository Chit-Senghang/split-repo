import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWarningTitleToEmployeeWarning1694422535318
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "employee_warning"
        ADD COLUMN "warning_title" VARCHAR(255) NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
