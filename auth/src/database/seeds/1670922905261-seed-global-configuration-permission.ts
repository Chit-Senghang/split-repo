import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedGlobalConfigurationPermission1660555854541
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` INSERT INTO "permission" (id, "version", "name", mpath, parent_id, updated_by, created_by, created_at, updated_at, deleted_at) 
      VALUES(158, 2, 'GLOBAL_CONFIGURATION', '81.158.', 154, NULL, NULL, 'NOW()', 'NOW()', NULL),
      (159, 2, 'READ_GLOBAL_CONFIGURATION', '81.158.159.', 158, NULL, NULL, 'NOW()', 'NOW()', NULL),
      (160, 2, 'UPDATE_GLOBAL_CONFIGURATION', '81.158.159.', 158, NULL, NULL, 'NOW()', 'NOW()', NULL)`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
