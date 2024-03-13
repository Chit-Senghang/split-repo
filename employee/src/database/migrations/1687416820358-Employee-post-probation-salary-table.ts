import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmployeePostProbationSalaryTable1687416820358
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "employee_post_probation_salary" (
          "id" SERIAL NOT NULL,
          "version" INTEGER DEFAULT 0,
          "employee_id" INTEGER NOT NULL,
          "salary_component_id" INTEGER NOT NULL,
          "increase_amount" DECIMAL NOT NULL DEFAULT 0,
          "status" VARCHAR(10) NULL,
          "updated_by" INTEGER,
          "created_by" INTEGER,
          "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "pk_employee_post_probation_salary_id" PRIMARY KEY ("id"),

          CONSTRAINT "fk_employee_post_probation_salary_employee_id"
          FOREIGN KEY ("employee_id") REFERENCES "employee"("id"),

          CONSTRAINT "fk_employee_post_probation_salary_salary_component_id" 
          FOREIGN KEY ("salary_component_id") REFERENCES "salary_component"("id")
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return await queryRunner.query(`
        DROP TABLE "employee_post_probation_salary";
    `);
  }
}
