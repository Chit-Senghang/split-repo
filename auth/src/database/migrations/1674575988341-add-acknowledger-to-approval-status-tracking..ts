import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAcknowledgerToApprovalStatusTracking1674575988341
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "approval_status"
        ADD COLUMN "acknowledge_user_id" INTEGER;
        ALTER TABLE "approval_status"
        ADD COLUMN "acknowledge_date" TIMESTAMPTZ;
        ALTER TABLE "approval_status"
        ADD COLUMN "first_approval_result" BOOLEAN;
        ALTER TABLE "approval_status"
        ADD COLUMN "first_approval_date" TIMESTAMPTZ;
        ALTER TABLE "approval_status"
        ADD COLUMN "first_approval_reason" VARCHAR;
        ALTER TABLE "approval_status"
        ADD COLUMN "second_approval_result" BOOLEAN;
        ALTER TABLE "approval_status"
        ADD COLUMN "second_approval_reason" VARCHAR;
        ALTER TABLE "approval_status"
        ADD COLUMN "second_approval_date" TIMESTAMPTZ;
        ALTER TABLE "approval_status"
        ADD CONSTRAINT "fk_approval_status_id_acknowledge_user_id" FOREIGN KEY ("acknowledge_user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "approval_status"
        ADD CONSTRAINT "fk_approval_status_id_approval_workflow_id" FOREIGN KEY ("approval_workflow_id") REFERENCES "request_approval_workflow" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
