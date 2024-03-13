import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPayrollBenefitHistory1690335215873
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payroll_benefit_history" (
            "id" INTEGER NOT NULL,
            "version" INTEGER DEFAULT 0,
            "employee_id" INTEGER NOT NULL,
            "benefit_component_id" INTEGER NOT NULL,
            "amount" DECIMAL NOT NULL DEFAULT(0),
            "for_year" INTEGER NULL,
            "for_month" INTEGER NULL,
            "is_monthly" BOOLEAN NOT NULL DEFAULT(false),
            "description" VARCHAR(255) NULL,
            "status" VARCHAR(10) NOT NULL,
            "type" VARCHAR(20) NOT NULL,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMPTZ NOT NULL,
            "updated_at" TIMESTAMPTZ NOT NULL,
            CONSTRAINT "pk_payroll_benefit_history_id" PRIMARY KEY ("id"),
            CONSTRAINT fk_employee_id_employee_id FOREIGN KEY (employee_id) REFERENCES employee(id),
            CONSTRAINT fk_benefit_component_id_benefit_component_id FOREIGN KEY (benefit_component_id) REFERENCES benefit_component(id)
        )`
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE payroll_benefit_history`);
  }
}
