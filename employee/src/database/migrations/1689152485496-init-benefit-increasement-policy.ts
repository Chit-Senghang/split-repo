import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitBenefitIncreasementPolicy1689152485496
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "benefit_increasement_policy" (
          "id" SERIAL NOT NULL,
          "version" INTEGER DEFAULT 0,
          "name" VARCHAR(255) NOT NULL,
          "updated_by" INTEGER,
          "created_by" INTEGER,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT pk_benefit_increasement_policy_id PRIMARY KEY ("id"),
          CONSTRAINT uk_name_benefit_increasement_policy UNIQUE ("name")
        );

        CREATE TABLE "benefit_increasement_policy_detail" (
            "id" SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "benefit_increasement_policy_id" INTEGER NOT NULL,
            "benefit_component_id" INTEGER NOT NULL,
            "increasement_amount" DECIMAL NOT NULL DEFAULT(0),
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT pk_benefit_increasement_policy_detail_id PRIMARY KEY ("id"),
            CONSTRAINT fk_benefit_increasement_policy_benefit_increasement_policy_id FOREIGN KEY ("benefit_increasement_policy_id") REFERENCES "benefit_increasement_policy" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT fk_benefit_component_benefit_component_id FOREIGN KEY ("benefit_component_id") REFERENCES "benefit_component" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT uk_benefit_increasement_policy_id_benefit_component_id UNIQUE ("benefit_increasement_policy_id","benefit_component_id")
        )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "benefit_increasement_policy";
      DROP TABLE "benefit_increasement_policy_detail";
    `);
  }
}
