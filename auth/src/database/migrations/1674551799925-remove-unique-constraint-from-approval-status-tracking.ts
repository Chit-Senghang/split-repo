import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeUniqueConstraintFromApprovalStatusTracking1674551799925
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX "uk_request_workflow_type_id_entity_id";
        ALTER TABLE "approval_status"
        ALTER COLUMN "request_to_update_json" TYPE TEXT;
        ALTER TABLE "approval_status"
        ALTER COLUMN "request_to_update_changes" TYPE TEXT;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
