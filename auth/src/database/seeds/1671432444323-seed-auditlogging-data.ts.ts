import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedAuditLogPermission1660555854541 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` INSERT INTO "permission" (id, "version", "name", mpath, parent_id, updated_by, created_by, created_at, updated_at, deleted_at) 
      VALUES(176, 2, 'AUDIT_LOG', '81.176.', 81, NULL, NULL, 'NOW()', 'NOW()', NULL),
      (177, 2, 'READ_AUDIT_LOG', '81.176.177.', 176, NULL, NULL, 'NOW()', 'NOW()', NULL)`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
