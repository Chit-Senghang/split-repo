import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyEmployeePosition1673930371003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "structure_department";
        DROP TABLE "structure_location";
        DROP TABLE "structure_outlet";
        DROP TABLE "structure_position";
    `);
    await queryRunner.query(
      `CREATE TABLE "company_structure_component" (
          "id" SERIAL NOT NULL,
          "version" integer NOT NULL DEFAULT(0),
          "type" VARCHAR(10) NOT NULL,
          "name" VARCHAR(255) NOT NULL,
          "updated_by" integer,
          "created_by" integer,
          "created_at" TIMESTAMPTZ DEFAULT now(),
          "updated_at" TIMESTAMPTZ DEFAULT now(),
          "deleted_at" TIMESTAMPTZ,
          CONSTRAINT "pk_company_structure_component_id" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uk_name_type" ON "company_structure_component" ("name","type")
      WHERE
        deleted_at is NULL;
    `);
    await queryRunner.query(`
        ALTER TABLE "company_structure"
        ADD "company_structure_component_id" integer NOT NULL;
        ALTER TABLE "company_structure"
        DROP COLUMN "structure_level_id";
        ALTER TABLE "company_structure"
        DROP COLUMN "mpath";
        ALTER TABLE "company_structure"
        ADD CONSTRAINT "fk_company_structure_component_id" FOREIGN KEY ("company_structure_component_id") REFERENCES "company_structure_component" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);
    await queryRunner.query(`
    CREATE UNIQUE INDEX "uk_company_structure_component_id_parent_id" ON "company_structure" ("company_structure_component_id","parent_id")
    WHERE
        deleted_at is NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE "employee_position"
      DROP CONSTRAINT "uk_is_default_position_company_structure_position_employee";
      CREATE UNIQUE INDEX "uk_is_default_position_employee_id" ON "employee_position" ("employee_id","is_default_position")
      WHERE
          deleted_at is NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
