import { MigrationInterface, QueryRunner } from 'typeorm';
import { LEAVE_REQUEST_PERMISSION } from '../../shared-resources/ts/enum/permission/leave/leave-request-permission.enum';
import { LEAVE_REQUEST_TYPE_PERMISSION } from '../../shared-resources/ts/enum/permission/leave/leave-request-type-permission.enum';

export class seedPermissionForLeaveRequestAndLeaveRequestType1675999705398
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //*Permission for Leave Request
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'LEAVE_REQUEST', (SELECT id FROM "permission" WHERE name = 'LEAVE_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('LEAVE_MODULE,LEAVE_REQUEST')
            WHERE name = 'LEAVE_REQUEST';
        `);

    for (const data in LEAVE_REQUEST_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'LEAVE_REQUEST'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('LEAVE_MODULE,LEAVE_REQUEST,${data}'))
            WHERE name = '${data}';
        `);
    }

    //*Permission for Leave Request Type
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'LEAVE_REQUEST_TYPE', (SELECT id FROM "permission" WHERE name = 'LEAVE_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('LEAVE_MODULE,LEAVE_REQUEST_TYPE')
            WHERE name = 'LEAVE_REQUEST_TYPE';
        `);

    for (const data in LEAVE_REQUEST_TYPE_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'LEAVE_REQUEST_TYPE'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('LEAVE_MODULE,LEAVE_REQUEST_TYPE,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
