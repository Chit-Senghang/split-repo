import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFkPositionLevelToCompanyStructure1672729656054
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "company_structure" 
      DROP COLUMN "name",
      DROP COLUMN "type",
      DROP COLUMN "detail",
      DROP COLUMN "employee_head_id",
      DROP COLUMN "address";
    `);

    await queryRunner.query(`
    ALTER TABLE "company_structure"
    ADD COLUMN "structure_level_id" INTEGER,
    ADD COLUMN "position_level_id" INTEGER NOT NULL,
    ADD COLUMN "structure_type" VARCHAR(50) NULL,
    ADD COLUMN "description" VARCHAR(255) NULL,
    ADD COLUMN "address" VARCHAR(1000) NULL,
    ADD COLUMN "fingerprint_ip_address" VARCHAR(100) NULL,
    ADD CONSTRAINT "fk_company_structure_position_level_id" FOREIGN KEY ("position_level_id") REFERENCES "position_level" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
  `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "company_structure"`);
  }
}
