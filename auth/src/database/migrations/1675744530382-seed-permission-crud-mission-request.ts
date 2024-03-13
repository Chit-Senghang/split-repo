import { MigrationInterface, QueryRunner } from 'typeorm';
import { MISSION_REQUEST_PERMISSION } from '../../shared-resources/ts/enum/permission/leave/mission-request-permission.enum';

export class seedPermissionCrudMissionRequest1675744530382
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'MISSION_REQUEST', (SELECT id FROM "permission" WHERE name = 'LEAVE_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('LEAVE_MODULE,MISSION_REQUEST')
            WHERE name = 'MISSION_REQUEST';
        `);

    for (const data in MISSION_REQUEST_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'MISSION_REQUEST'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('LEAVE_MODULE,MISSION_REQUEST,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
