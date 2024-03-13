import { MigrationInterface, QueryRunner } from 'typeorm';
import { MEDIA_PERMISSION } from '../../shared-resources/ts/enum/permission/authentication/media-permission.enum';

export class seedPermissionMedia1675930628577 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'MEDIA', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('AUTHENTICATION_MODULE,MEDIA')
            WHERE name = 'MEDIA';
        `);

    for (const data in MEDIA_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'MEDIA'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('AUTHENTICATION_MODULE,MEDIA,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
