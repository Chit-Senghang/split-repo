import { MigrationInterface, QueryRunner } from 'typeorm';
import { OVERTIME_REQUEST_TYPE_PERMISSION } from '../../shared-resources/ts/enum/permission/attendance/overtime-request-type.enum';

export class seedPermissionOvertimeRequestType1674010167437
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'OVERTIME_REQUEST_TYPE', (SELECT id FROM "permission" WHERE name = 'ATTENDANCE_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('ATTENDANCE_MODULE,OVERTIME_REQUEST_TYPE')
            WHERE name = 'OVERTIME_REQUEST_TYPE';
        `);

    for (const data in OVERTIME_REQUEST_TYPE_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'OVERTIME_REQUEST_TYPE'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('ATTENDANCE_MODULE,OVERTIME_REQUEST_TYPE,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
