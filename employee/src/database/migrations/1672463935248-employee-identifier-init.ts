import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeIdentifierInit1672463935248 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "employee_identifier" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT 0,
            "employee_id" integer NOT NULL,
            "document_type_id" integer NOT NULL,
            "document_identifier" VARCHAR(255) NOT NULL,
            "description" VARCHAR(255) NULL,
            "expire_date" DATE NULL,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_employee_identifier" PRIMARY KEY ("id"),
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_document_type_id_code_value_id" FOREIGN KEY ("document_type_id") REFERENCES "code_value" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_id_identifier_document_type_id_document_identifier" ON "employee_identifier" ("employee_id","document_type_id","document_identifier")
        WHERE
            deleted_at is NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "employee_identifier"`);
  }
}
