import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewPermissionUpdateNotificationToEssUserRole1695286330297
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    const essRole = await queryRunner.query(
      `
        SELECT id, name FROM "role"
            WHERE name = 'ESS User' AND is_system_defined  = 'true'
            `
    );

    const permission = await queryRunner.query(
      `SELECT id,name FROM "permission" WHERE "name" = 'UPDATE_NOTIFICATION'`
    );

    await queryRunner.query(
      `INSERT INTO "role_permission"
            ("version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
        VALUES (1,${essRole[0].id},${permission[0].id}, NULL, NULL, NOW(), NOW(), NULL) ON CONFLICT DO NOTHING;`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
