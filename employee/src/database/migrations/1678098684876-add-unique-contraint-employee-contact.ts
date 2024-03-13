import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueContraintEmployeeContact1678098684876
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "uk_employee_contact_is_default"`
    );

    await queryRunner.query(`
    CREATE UNIQUE INDEX "uk_employee_contact_employee_id_contact_is_default" ON "employee_contact" ("employee_id","contact","is_default")
    WHERE
    deleted_at is NULL
    AND is_default=true;
  `);
  }

  async down(): Promise<void> {
    return;
  }
}
