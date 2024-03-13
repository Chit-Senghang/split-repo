import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeePositionTable1673494981213 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "employee_position" (
            "id" SERIAL NOT NULL,
            "version" INTEGER NOT NULL DEFAULT(0),
            "employee_id" INTEGER NOT NULL,
            "company_structure_company_id" INTEGER NOT NULL,
            "company_structure_location_id" INTEGER NOT NULL,
            "company_structure_outlet_id" INTEGER NOT NULL,
            "company_structure_department_id" INTEGER NOT NULL,
            "company_structure_position_id" INTEGER NOT NULL,
            "is_default_position" BOOLEAN NOT NULL DEFAULT TRUE,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMP WITH TIME ZONE,
            "deleted_at" TIMESTAMP WITH TIME ZONE,

            CONSTRAINT "pk_employee_position" PRIMARY KEY ("id"),
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,

            CONSTRAINT "fk_company_structure_company_id_company_structure_id" FOREIGN KEY ("company_structure_company_id") REFERENCES "company_structure" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_company_structure_location_id_company_structure_id" FOREIGN KEY ("company_structure_location_id") REFERENCES "company_structure" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_company_structure_outlet_id_company_structure_id" FOREIGN KEY ("company_structure_outlet_id") REFERENCES "company_structure" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_company_structure_department_id_company_structure_id" FOREIGN KEY ("company_structure_department_id") REFERENCES "company_structure" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_company_structure_position_id_company_structure_id" FOREIGN KEY ("company_structure_position_id") REFERENCES "company_structure" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,

            CONSTRAINT "uk_is_default_position_company_structure_position_employee" UNIQUE ("is_default_position","company_structure_position_id", "employee_id")
        )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uk_employee_position_employee_company_structure_position" ON "employee_position" ("employee_id", "company_structure_position_id")
      WHERE
        deleted_at is NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "employee_position"`);
  }
}
