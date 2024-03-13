import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPayrollDeduction1687579407692 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "payroll_deduction" (
            "id" SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "payroll_deduction_type_id" INTEGER NOT NULL,
            "employee_id" INTEGER NOT NULL,
            "deduction_date" DATE NOT NULL,
            "amount" DECIMAL NOT NULL DEFAULT(0),
            "description" VARCHAR(255) NULL,
            "status" VARCHAR(10) NOT NULL,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT "pk_payroll_deduction_id" PRIMARY KEY ("id"),
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY(employee_id) REFERENCES employee(id),
            CONSTRAINT "fk_payroll_deduction_type_id_payroll_deduction_type_id" FOREIGN KEY(payroll_deduction_type_id) REFERENCES payroll_deduction_type(id)
        )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    return await queryRunner.query(`DROP TABLE payroll_deduction`);
  }
}
