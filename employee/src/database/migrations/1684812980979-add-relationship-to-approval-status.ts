import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationshipToApprovalStatus1684812980979
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "approval_status"
        ADD CONSTRAINT "fk_approval_status_id_request_workflow_type" FOREIGN KEY ("request_workflow_type_id") REFERENCES "request_work_flow_type" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        ALTER TABLE "approval_status"
        ADD CONSTRAINT "fk_approval_status_id_approval_workflow_id" FOREIGN KEY ("approval_workflow_id") REFERENCES "request_approval_workflow" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
