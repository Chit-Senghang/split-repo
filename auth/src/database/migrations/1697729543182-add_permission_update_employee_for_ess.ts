import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPermissionUpdateEmployeeForEss1697729543182
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        INSERT INTO "role_permission" 
        ("version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
    VALUES (1,(SELECT id FROM role WHERE name = 'ESS User'),(SELECT id FROM permission WHERE name = 'UPDATE_EMPLOYEE_MASTER_INFORMATION'), NULL, NULL, now(), now(), NULL)
    ON CONFLICT DO NOTHING;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
