import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPayrollDeductionType1687486310790
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "payroll_deduction_type" (
            "id" SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "name" VARCHAR(255) NOT NULL,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT "pk_payroll_deduction_type_id" PRIMARY KEY ("id"),
            CONSTRAINT uk_payroll_deduction_type_name UNIQUE (name)
        )
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
