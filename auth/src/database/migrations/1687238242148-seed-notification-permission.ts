import { MigrationInterface, QueryRunner } from 'typeorm';
import { NOTIFICATION_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/notification.enum';

export class SeedNotificationPermission1687238242148
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'NOTIFICATION', (SELECT id FROM "permission" WHERE name = 'ADMIN'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('ADMIN,NOTIFICATION')
            WHERE name = 'NOTIFICATION';
        `);

    for (const data in NOTIFICATION_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'NOTIFICATION'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('ADMIN,NOTIFICATION,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
