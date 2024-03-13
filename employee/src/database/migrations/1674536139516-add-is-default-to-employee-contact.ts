import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIsDefaultToEmployeeContact1674536139516
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
     ALTER TABLE "employee_contact"
     ADD COLUMN "is_default" BOOLEAN NOT NULL DEFAULT(FALSE);
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_contact_is_default" ON "employee_contact" ("is_default","contact")
        WHERE
            deleted_at is NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
