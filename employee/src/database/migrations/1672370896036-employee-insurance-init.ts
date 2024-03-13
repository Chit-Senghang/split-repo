import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeInsuranceInit1672370896036 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "employee_insurance" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT 0,
            "employee_id" integer NOT NULL,
            "insurance_id" integer NOT NULL,
            "card_number" VARCHAR(100) NOT NULL,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_employee_insurance_id" PRIMARY KEY ("id"),
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_insurance_id_insurance_id" FOREIGN KEY ("insurance_id") REFERENCES "insurance" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_insurance_employee_id_insurance_id_deleted_at" ON "employee_insurance" ("employee_id","insurance_id")
        WHERE
            deleted_at is NULL;
        CREATE UNIQUE INDEX "uk_employee_insurance_employee_id_insurance_id_card_number_deleted_at" ON "employee_insurance" ("employee_id","insurance_id","card_number")
        WHERE
            deleted_at is NULL
        
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "employee_insurance"`);
  }
}
