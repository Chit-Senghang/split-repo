import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUkEmployeePositionEmployeeCompanyStructurePositionIsMov1703132079884
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    //update duplicate default position to false
    await queryRunner.query(`
      UPDATE
          "employee_position"
      SET
          "is_default_position" = false
      WHERE "id"
          NOT IN (
          SELECT
              DISTINCT on ("employee_id")
          "id"
          FROM
              "employee_position"
          WHERE
              "is_default_position" is true
          AND 
              "is_moved" is false
      )
    `);

    await queryRunner.query(`
        DROP INDEX IF EXISTS "uk_employee_position_employee_company_structure_position_is_mov"
    `);

    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_default_position" ON "employee_position" ("employee_id", "is_default_position","is_moved") where "is_default_position" is true
        AND is_moved = false;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
