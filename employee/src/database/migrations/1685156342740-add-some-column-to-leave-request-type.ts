import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSomeColumnToLeaveRequestType1685156342740
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "leave_request_type"
            ADD COLUMN "policy_employment_type" VARCHAR(20),
            ADD COLUMN "policy_gender" VARCHAR(7),
            ADD COLUMN "policy_employee_status" VARCHAR(20),
            ADD COLUMN "policy_prorated_per_month" DECIMAL NULL DEFAULT 0,
            ADD COLUMN "policy_allowance_per_year" DECIMAL NULL DEFAULT 0,
            ADD COLUMN "policy_increment_rule" DECIMAL NULL DEFAULT 0,
            ADD COLUMN "policy_increment_allowance" DECIMAL NULL DEFAULT 0,
            ADD COLUMN "policy_cover_from" VARCHAR(100),
            ADD COLUMN "policy_require_doc" DECIMAL NULL DEFAULT 0,
            ADD COLUMN "policy_allowance_rule" DECIMAL NULL DEFAULT 0,
            ADD COLUMN "policy_allowance" DECIMAL NULL DEFAULT 0,
            ADD COLUMN "policy_carry_is_forward" Boolean,
            ADD COLUMN "policy_carry_forward" INTEGER;
        `);
  }

  async down(): Promise<void> {
    return;
  }
}
