import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeContactInit1672280527803 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "employee_contact" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT 0,
            "employee_id" integer NOT NULL,
            "contact" VARCHAR(20) NOT NULL,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_employee_contact_id" PRIMARY KEY ("id"),
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_id_contact_deleted_at" ON "employee_contact" ("employee_id","contact")
        WHERE
            deleted_at is NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "employee_contact"`);
  }
}
