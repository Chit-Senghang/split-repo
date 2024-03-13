import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNewPositionLevel1675682529668 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM "employee_position";
        DELETE FROM "company_structure";
        DELETE FROM "position_level";
    `);
    await queryRunner.query(
      `INSERT INTO position_level
            (
              "level_title",
              "level_number",
              "created_by"
            )
          VALUES
            ('CHIEF',6,NULL),
            ('HEAD OF DEPARTMENT',5,NULL),
            ('MANAGER, DEPUTY MANAGER',4,NULL),
            ('SUPERVISOR',3,NULL),
            ('SENIOR OFFICER, OFFICER',2,NULL),
            ('CREW',1,NULL),
            ('INTERN',0,NULL)
            `
    );
  }

  async down(): Promise<void> {
    return;
  }
}
