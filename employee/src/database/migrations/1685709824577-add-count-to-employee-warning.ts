import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountToEmployeeWarning1685709824577
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee_warning"
        ADD COLUMN "count" INTEGER NOT NULL DEFAULT(0);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
