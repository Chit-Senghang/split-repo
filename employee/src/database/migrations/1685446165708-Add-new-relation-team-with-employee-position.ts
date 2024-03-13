import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewRelationTeamWithEmployeePosition1685446165708
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_position"
      ADD COLUMN "company_structure_team_id" INTEGER DEFAULT NULL,
      ADD CONSTRAINT "fk_company_structure_team_id_company_structure_id" FOREIGN KEY ("company_structure_team_id") REFERENCES "company_structure" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
