import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyEmployeeWarming1673663718305 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "employee_warning";
    `);
    await queryRunner.query(`
        CREATE TABLE "employee_warning" (
            "id" SERIAL NOT NULL, 
            "version" integer NOT NULL DEFAULT(0), 
            "employee_id" integer NOT NULL, 
            "warning_type_id" integer NOT NULL, 
            "reason" VARCHAR(255) NOT NULL,
            "status" VARCHAR(10) NOT NULL,
            "updated_by" integer, 
            "created_by" integer, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "deleted_at" TIMESTAMP, 
            CONSTRAINT "pk_employee_warning_id" PRIMARY KEY ("id"),
            CONSTRAINT "fk_warning_type_id_code_value_id" FOREIGN KEY ("warning_type_id") REFERENCES "code_value" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        );
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
