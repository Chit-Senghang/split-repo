import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAddCrudMediaPermissionForEssUser1698661053192
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "role_permission" 
            ("version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
        VALUES (1,(SELECT id FROM role WHERE name = 'ESS User'),(SELECT id FROM permission WHERE name = 'READ_MEDIA'), NULL, NULL, now(), now(), NULL) ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
        INSERT INTO "role_permission" 
            ("version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
        VALUES (1,(SELECT id FROM role WHERE name = 'ESS User'),(SELECT id FROM permission WHERE name = 'CREATE_MEDIA'), NULL, NULL, now(), now(), NULL) ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
        INSERT INTO "role_permission" 
            ("version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
        VALUES (1,(SELECT id FROM role WHERE name = 'ESS User'),(SELECT id FROM permission WHERE name = 'UPDATE_MEDIA'), NULL, NULL, now(), now(), NULL) ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
        INSERT INTO "role_permission" 
            ("version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
        VALUES (1,(SELECT id FROM role WHERE name = 'ESS User'),(SELECT id FROM permission WHERE name = 'DELETE_MEDIA'), NULL, NULL, now(), now(), NULL) ON CONFLICT DO NOTHING;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
