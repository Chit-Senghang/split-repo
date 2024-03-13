import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateApprovalStatusTracking1674183423451
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "approval_status"
        ALTER COLUMN "updated_at" DROP NOT NULL;
    `);
    await queryRunner.query(`
        DELETE FROM "approval_status";
        CREATE UNIQUE INDEX "uk_request_workflow_type_id_entity_id" ON "approval_status" ("entity_id","request_workflow_type_id")
        WHERE
        deleted_at is NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
