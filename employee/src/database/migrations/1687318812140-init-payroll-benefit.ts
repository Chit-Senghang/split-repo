import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPayrollBenefit1687318812140 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payroll_benefit" (
            "id" SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "employee_id" INTEGER NOT NULL,
            "salary_component_id" INTEGER NOT NULL,
            "amount" DECIMAL NOT NULL DEFAULT(0),
            "for_year" INTEGER NULL,
            "for_month" INTEGER NULL,
            "is_monthly" BOOLEAN NOT NULL DEFAULT(false),
            "description" VARCHAR(255) NULL,
            "status" VARCHAR(10) NOT NULL,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT "pk_payroll_benefit_id" PRIMARY KEY ("id"),
            CONSTRAINT fk_employee_id_employee_id FOREIGN KEY (employee_id) REFERENCES employee(id),
            CONSTRAINT fk_salary_component_id_salary_component_id FOREIGN KEY (salary_component_id) REFERENCES salary_component(id)
        )`
    );

    await queryRunner.query(`
        INSERT INTO "request_work_flow_type" (version, "request_type", "description")
        VALUES(0, 'PAYROLL_BENEFIT', 'payroll benefit');
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    return await queryRunner.query(`
        DROP TABLE payroll_benefit;
    `);
  }
}
