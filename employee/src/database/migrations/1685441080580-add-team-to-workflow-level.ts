import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeamToWorkflowLevel1685441080580 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "request_approval_workflow_level"
        ADD COLUMN "company_structure_team_id" INTEGER NULL;
        ALTER TABLE "request_approval_workflow_level"
        ADD CONSTRAINT "fk_company_structure_team_id_company_structure_team_id" FOREIGN KEY ("company_structure_team_id") REFERENCES "company_structure" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
