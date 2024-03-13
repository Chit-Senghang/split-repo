import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeMasterInformation1659596499216
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."employee_gender_enums" AS ENUM('MALE', 'FEMALE', 'OTHER')`
    );

    await queryRunner.query(
      `CREATE TYPE "public"."employee_marital_status_enums" AS ENUM('MARRIED','SINGLE','WIDOWED','OTHER')`
    );

    await queryRunner.query(
      `CREATE TABLE "employee" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL,
        "first_name" character varying NOT NULL,
        "middle_name" character varying,
        "last_name" character varying NOT NULL,
        "dob" TIMESTAMP NOT NULL,
        "gender" "public"."employee_gender_enums" NOT NULL,
        "marital_status" "public"."employee_marital_status_enums" NOT NULL,
        "profile_picture" character varying NOT NULL,
        "indentify_number" character varying NOT NULL,
        "driver_license_number" character varying,
        "finger_print" integer NOT NULL,
        "starting_date" TIMESTAMP NOT NULL,
        "village" character varying,
        "postal_code" character varying,
        "home_phone" character varying,
        "mobile_phone" character varying,
        "work_phone" character varying,
        "work_email" character varying,
        "private_email" character varying,
        "nationality_id" integer,
        "immigration_status_id" integer,
        "branch_id" integer,
        "department_id" integer,
        "employee_status_id" integer,
        "job_title_id" integer,
        "pay_grade_id" integer,
        "country_id" integer,
        "province_id" integer,
        "supervisor_id" integer,
        "indirect_supervisor_id" integer,
        "first_approver_id" integer,
        "second_approver_id" integer,
        "third_approver_id" integer,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uk_employee_fingerprint" UNIQUE ("finger_print"),
        CONSTRAINT "pk_employee_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_nationality_key_value_id" FOREIGN KEY ("nationality_id") REFERENCES "key_value" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_immigration_status_id_key_value_id" FOREIGN KEY ("immigration_status_id") REFERENCES "key_value" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_branch_id_company_structure_id" FOREIGN KEY ("branch_id") REFERENCES "company_structure" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_department_id_company_structure_id" FOREIGN KEY ("department_id") REFERENCES "company_structure" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_employee_status_employee_status_id" FOREIGN KEY ("employee_status_id") REFERENCES "employee_status" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "job_titile_id_job_title_id" FOREIGN KEY ("job_title_id") REFERENCES "job_title" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "pay_grade_id_pay_grade_id" FOREIGN KEY ("pay_grade_id") REFERENCES "pay_grade" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_country_id_key_value_id" FOREIGN KEY ("country_id") REFERENCES "key_value" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_province_id_key_value_id" FOREIGN KEY ("province_id") REFERENCES "key_value" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_employee_supervisor_employee_id" FOREIGN KEY ("supervisor_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_employee_indirect_supervisor_employee_id" FOREIGN KEY ("indirect_supervisor_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_employee_first_approver_employee_id" FOREIGN KEY ("first_approver_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_employee_second_approver_employee_id" FOREIGN KEY ("second_approver_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_employee_third_approver_employee_id" FOREIGN KEY ("third_approver_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_employee_third_approver_employee_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_employee_second_approver_employee_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_employee_first_approver_employee_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_employee_indirect_supervisor_employee_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_employee_supervisor_employee_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_province_id_key_value_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_country_id_key_value_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "pay_grade_id_pay_grade_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "job_titile_id_job_title_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_employee_status_employee_status_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_department_id_company_structure_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_branch_id_company_structure_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_immigration_status_id_key_value_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "fk_nationality_key_value_id"`
    );
    await queryRunner.query(`DROP TABLE "employee"`);
    await queryRunner.query(
      `DROP TYPE "public"."employee_marital_status_enums"`
    );
    await queryRunner.query(`DROP TYPE "public"."employee_gender_enums"`);
  }
}
