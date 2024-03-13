import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnToCompanyStructure1689223533029
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "company_structure"
        ADD COLUMN "post_probation_benefit_increasement_policy_id" INTEGER NULL DEFAULT(null),
        ADD CONSTRAINT "fk_company_structure_post_probation_benefit_increasement_policy_id" FOREIGN KEY ("post_probation_benefit_increasement_policy_id") REFERENCES "benefit_increasement_policy" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "company_structure_component"
        ADD COLUMN "post_probation_benefit_increasement_policy_id" INTEGER NULL DEFAULT(null),
        ADD CONSTRAINT "fk_company_structure_component_post_probation_benefit_increasement_policy_id" FOREIGN KEY ("post_probation_benefit_increasement_policy_id") REFERENCES "benefit_increasement_policy" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
