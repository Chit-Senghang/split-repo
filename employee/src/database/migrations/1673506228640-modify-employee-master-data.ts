import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyEmployeeMasterData1673506228640
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM employee_warning;
        DELETE FROM employee_position;
        DELETE FROM employee;
        ALTER TABLE "employee" ADD "account_no" VARCHAR(20) NOT NULL;
        ALTER TABLE "employee" RENAME COLUMN "finger_print" to "finger_print_id";
        ALTER TABLE "employee" DROP COLUMN "employee_status_id";
        ALTER TABLE "employee" ADD "employment_status" VARCHAR(10) NOT NULL;
        ALTER TABLE "employee" ADD "last_name_en" VARCHAR(255) NOT NULL;
        ALTER TABLE "employee" RENAME COLUMN "first_name" to "first_name_en";
        ALTER TABLE "employee" DROP COLUMN "middle_name";
        ALTER TABLE "employee" ADD "first_name_kh" VARCHAR(255) NOT NULL;
        ALTER TABLE "employee" ADD "last_name_kh" VARCHAR(255) NOT NULL;
        CREATE INDEX "index_first_name_kh_last_name_kh" on "employee" ("first_name_kh","last_name_kh");
        CREATE INDEX "index_first_name_en_last_name_en" on "employee" ("first_name_en","last_name_en");
        ALTER TABLE "employee" DROP COLUMN "gender";
        ALTER TABLE "employee" ADD "gender" VARCHAR(10) NOT NULL;
        ALTER TABLE "employee" RENAME COLUMN "starting_date" to "start_date";
        ALTER TABLE "employee" ADD "post_probation_date" date NULL;
        ALTER TABLE "employee" ADD "resign_date" date NULL;
        ALTER TABLE "employee" ADD "contract_type" VARCHAR(10) NOT NULL;
        ALTER TABLE "employee" ADD "contract_period_start_date" date NULL;
        ALTER TABLE "employee" ADD "contract_period_end_date" date NULL;
        ALTER TABLE "employee" ADD "employment_type" VARCHAR(20) NOT NULL;
        ALTER TABLE "employee" ADD "working_shift_id" integer NOT NULL;
        ALTER TABLE "employee" ADD CONSTRAINT "fk_working_shift_id_working_shift_id" FOREIGN KEY ("working_shift_id") REFERENCES "working_shift"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "employee" ADD "age" integer NULL;
        ALTER TABLE "employee" ADD "place_of_birth_id" integer NOT NULL;
        ALTER TABLE "employee" ADD CONSTRAINT "fk_place_of_birth_id_geographic_id" FOREIGN KEY ("place_of_birth_id") REFERENCES "geographic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "employee" ADD "email" VARCHAR(255) NULL;
        ALTER TABLE "employee" DROP COLUMN "marital_status";
        ALTER TABLE "employee" ADD "marital_status" VARCHAR(20) NULL;
        ALTER TABLE "employee" ADD "spouse" integer NULL;
        ALTER TABLE "employee" ADD CONSTRAINT "fk_spouse_code_value_id" FOREIGN KEY ("spouse") REFERENCES "code_value"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "employee" ADD "spouse_occupation" VARCHAR(255) NULL;
        ALTER TABLE "employee" ADD "number_of_children" integer NULL default(0);
        ALTER TABLE "employee" ADD "address_home_number" VARCHAR(20) NULL;
        ALTER TABLE "employee" ADD "address_street_number" VARCHAR(20) NULL;
        ALTER TABLE "employee" ADD "address_village_id" integer NULL;
        ALTER TABLE "employee" ADD CONSTRAINT "fk_address_village_id_geographic_id" FOREIGN KEY ("address_village_id") REFERENCES "geographic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "employee" ADD "address_province_id" integer NULL;
        ALTER TABLE "employee" ADD CONSTRAINT "fk_address_province_id_geographic_id" FOREIGN KEY ("address_province_id") REFERENCES "geographic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "employee" ADD "address_district_id" integer NULL;
        ALTER TABLE "employee" ADD CONSTRAINT "fk_address_district_id_geographic_id" FOREIGN KEY ("address_district_id") REFERENCES "geographic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "employee" ADD "address_commune_id" integer NULL;
        ALTER TABLE "employee" ADD CONSTRAINT "fk_address_commune_id_geographic_id" FOREIGN KEY ("address_commune_id") REFERENCES "geographic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "employee" ADD "tax_responsible" VARCHAR(20) NULL;
        ALTER TABLE "employee" ADD "status" VARCHAR(20) NOT NULL;
        ALTER TABLE "employee" DROP COLUMN "profile_picture";
        ALTER TABLE "employee" DROP COLUMN "indentify_number";
        ALTER TABLE "employee" DROP "driver_license_number";
        ALTER TABLE "employee" DROP "village";
        ALTER TABLE "employee" DROP "postal_code";
        ALTER TABLE "employee" DROP "home_phone";
        ALTER TABLE "employee" DROP "mobile_phone";
        ALTER TABLE "employee" DROP "work_phone";
        ALTER TABLE "employee" DROP "work_email";
        ALTER TABLE "employee" DROP "private_email";
        ALTER TABLE "employee" DROP "immigration_status_id";
        ALTER TABLE "employee" DROP "branch_id";
        ALTER TABLE "employee" DROP "department_id";
        ALTER TABLE "employee" DROP "job_title_id";
        ALTER TABLE "employee" DROP "pay_grade_id";
        ALTER TABLE "employee" DROP "country_id";
        ALTER TABLE "employee" DROP "province_id";
        ALTER TABLE "employee" DROP "supervisor_id";
        ALTER TABLE "employee" DROP "indirect_supervisor_id";
        ALTER TABLE "employee" DROP "first_approver_id";
        ALTER TABLE "employee" DROP "second_approver_id";
        ALTER TABLE "employee" DROP "third_approver_id";
        ALTER TABLE "employee" DROP "last_name";
        ALTER TABLE "employee" DROP CONSTRAINT "uk_employee_fingerprint";
        CREATE UNIQUE INDEX "uk_employee_finger_print_id" ON "employee" ("finger_print_id")
        WHERE
            deleted_at is NULL;
        CREATE UNIQUE INDEX "uk_employee_account_no" ON "employee" ("account_no")
        WHERE
            deleted_at is NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
