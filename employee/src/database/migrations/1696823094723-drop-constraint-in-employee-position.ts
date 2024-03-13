import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropConstraintInEmployeePosition1696823094723
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee_position" DROP CONSTRAINT "uk_employee_position_employee_company_structure_position_is_mov";
        DROP INDEX IF EXISTS "uk_employee_position_employee_company_structure_position_is_mov";
    `);

    await queryRunner.query(`
    CREATE UNIQUE INDEX "uk_employee_position_employee_company_structure_position_is_mov" 
    ON "employee_position" ("employee_id", "company_structure_position_id", "is_moved")
        WHERE
        "is_moved" = FALSE;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
