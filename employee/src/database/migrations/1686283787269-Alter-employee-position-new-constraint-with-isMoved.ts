import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterEmployeePositionNewConstraintWithIsMoved1686283787269
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX uk_is_default_position_employee_id`);
    await queryRunner.query(
      `DROP INDEX uk_employee_position_employee_company_structure_position`
    );
    await queryRunner.query(
      `
      ALTER TABLE "employee_position"
      ADD CONSTRAINT "uk_employee_position_employee_company_structure_position_is_moved" UNIQUE ("employee_id", "company_structure_position_id", "is_moved");
      `
    );
  }

  async down(): Promise<void> {
    return;
  }
}
