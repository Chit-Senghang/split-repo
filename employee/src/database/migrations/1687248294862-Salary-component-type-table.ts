import { MigrationInterface, QueryRunner } from 'typeorm';

export class SalaryComponentTypeTable1687248294862
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "salary_component_type" (
        "id" SERIAL NOT NULL,
        "version" INTEGER DEFAULT 0,
        "name" VARCHAR(255) NOT NULL,
        "tax_percentage" DECIMAL NOT NULL DEFAULT 0,
        "updated_by" INTEGER,
        "created_by" INTEGER,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "pk_salary_component_type_id" PRIMARY KEY ("id"),
        CONSTRAINT uk_salary_component_type_name UNIQUE(name)
      )`
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "salary_component_type"`);
  }
}
