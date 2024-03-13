import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewPermissionToEssUser1694159560247
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    const essRole = await queryRunner.query(
      `
      SELECT id, name FROM "role" 
      WHERE name = 'ESS User' AND is_system_defined  = 'true'
      `
    );

    const ssuPermission = await queryRunner.query(
      `SELECT id,name FROM "permission" WHERE "name" IN(
        'READ_APPROVAL_STATUS_TRACKING',
        'UPDATE_APPROVAL_STATUS_TRACKING'
      );`
    );

    for (const permission of ssuPermission) {
      await queryRunner.query(
        `INSERT INTO "role_permission" 
            ("version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
            VALUES (1,${essRole[0].id},${permission.id}, NULL, NULL, now(), now(), NULL) ON CONFLICT DO NOTHING;`
      );
    }
  }

  async down(): Promise<void> {
    return;
  }
}
