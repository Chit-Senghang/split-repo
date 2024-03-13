import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeResignation1659665642447 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "employee_resignation_type" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uk_employee_resignation_type_name" UNIQUE ("name"),
        CONSTRAINT "pk_employee_resignation_type_id" PRIMARY KEY ("id")
        )`
    );

    await queryRunner.query(
      `CREATE TABLE "employee_resignation_reason_template" (
        "id" SERIAL NOT NULL,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "version" integer NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        CONSTRAINT "uk_employee_resignation_reason_template_name" UNIQUE ("name"),
        CONSTRAINT "pk_employee_resignation_reason_template_id" PRIMARY KEY ("id")
  )`
    );

    await queryRunner.query(
      `CREATE TABLE "employee_resignation" (
        "id" SERIAL NOT NULL,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "version" integer NOT NULL,
        "date" TIMESTAMP NOT NULL,
        "employee_id" integer,
        "resignation_type_id" integer,
        "resignation_reason_template_id" integer,
        CONSTRAINT "pk_employee_resignation_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_employee_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_resignation_type_employee_resignation_type_id" FOREIGN KEY ("resignation_type_id") REFERENCES "employee_resignation_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_resignation_reason_temp_emp_resignation_reason_temp_id" FOREIGN KEY ("resignation_reason_template_id") REFERENCES "employee_resignation_reason_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" DROP CONSTRAINT "fk_resignation_reason_template_employee_resignation_reason_template_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" DROP CONSTRAINT "fk_resignation_type_employee_resignation_type_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" DROP CONSTRAINT "fk_employee_employee_id"`
    );
    await queryRunner.query(`DROP TABLE "employee_resignation"`);
    await queryRunner.query(
      `DROP TABLE "employee_resignation_reason_template"`
    );
    await queryRunner.query(`DROP TABLE "employee_resignation_type"`);
  }
}
