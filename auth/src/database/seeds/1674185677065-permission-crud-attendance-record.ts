import { MigrationInterface, QueryRunner } from 'typeorm';
import { ATTENDANCE_RECORD_PERMISSION } from '../../shared-resources/ts/enum/permission';

export class permissionCrudAttendanceRecord1674185677065
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'ATTENDANCE_RECORD', (SELECT id FROM "permission" WHERE name = 'ATTENDANCE_MODULE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('ATTENDANCE_MODULE,ATTENDANCE_RECORD')
        WHERE name = 'ATTENDANCE_RECORD';
    `);

    for (const data in ATTENDANCE_RECORD_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'ATTENDANCE_RECORD'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('ATTENDANCE_MODULE,ATTENDANCE_RECORD,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
