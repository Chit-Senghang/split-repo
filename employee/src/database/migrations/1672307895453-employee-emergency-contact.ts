import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeEmergencyContact1672307895453
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "employee_emergency_contact" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT 0,
            "employee_id" integer NOT NULL,
            "contact" VARCHAR(20) NOT NULL,
            "contact_relationship_id" integer NULL,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_employee_emergency_contact_id" PRIMARY KEY ("id"),
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_contact_relationship_id_code_value_id" FOREIGN KEY ("contact_relationship_id") REFERENCES "code_value" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_emergency_contact_employee_id_contact" ON "employee_emergency_contact" ("employee_id","contact")
        WHERE
            deleted_at is NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "employee_emergency_contact"`);
  }
}
