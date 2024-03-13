import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyEmployeePositionUniqueConstraint1698389980115
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS "uk_employee_position_employee_company_structure_position_is_mov";
    `);

    await queryRunner.query(`
        CREATE UNIQUE INDEX 
            "uk_employee_position_employee_company_structure_position_is_move" 
        ON 
            "employee_position" ("employee_id", "company_structure_position_id", "is_moved")
        WHERE
            "is_moved" = FALSE AND "deleted_at" IS NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
