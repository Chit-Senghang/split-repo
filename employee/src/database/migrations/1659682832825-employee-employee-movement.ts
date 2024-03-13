import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeEmployeeMovement1659682832825
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."employee_movement_movement_type" AS ENUM('PROMOTE','DEMOTE','TRANSFER')`
    );
    await queryRunner.query(
      `CREATE TABLE "employee_movement" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL,
        "effective_date" TIMESTAMP NOT NULL,
        "salary" integer NOT NULL,
        "movement_type" "public"."employee_movement_movement_type" NOT NULL,
        "employee_id" integer,
        "current_branch_id" integer,
        "current_job_title_id" integer,
        "new_branch_id" integer,
        "new_department_id" integer,
        "new_job_title_id" integer,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "pk_employee_movement_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_current_branch_id_company_structure_id" FOREIGN KEY ("current_branch_id") REFERENCES "company_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_current_job_title_job_title_id" FOREIGN KEY ("current_job_title_id") REFERENCES "job_title"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_new_branch_company_structure_id" FOREIGN KEY ("new_branch_id") REFERENCES "company_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_new_department_company_structure_id" FOREIGN KEY ("new_department_id") REFERENCES "company_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_new_job_title_job_title_id" FOREIGN KEY ("new_job_title_id") REFERENCES "job_title"("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_movement" 
        DROP CONSTRAINT "fk_new_job_title_job_title_id",
        DROP CONSTRAINT "fk_new_department_company_structure_id",
        DROP CONSTRAINT "fk_new_branch_company_structure_id",
        DROP CONSTRAINT "fk_current_job_title_job_title_id",
        DROP CONSTRAINT "fk_current_branch_id_company_structure_id",
        DROP CONSTRAINT "fk_employee_id_employee_id"`
    );
    await queryRunner.query(`DROP TABLE "employee_movement"`);
    await queryRunner.query(
      `DROP TYPE "public"."employee_movement_movement_type"`
    );
  }
}
