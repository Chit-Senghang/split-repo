import { MigrationInterface, QueryRunner } from 'typeorm';
import { MISSED_SCAN_REQUEST_PERMISSION } from '../../shared-resources/ts/enum/permission/attendance/missed-scan-request.enum';

export class permissionCrudMissedScanRequest1675233573426
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'MISSED_SCAN_REQUEST', (SELECT id FROM "permission" WHERE name = 'ATTENDANCE_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('ATTENDANCE_MODULE,MISSED_SCAN_REQUEST')
            WHERE name = 'MISSED_SCAN_REQUEST';
        `);

    for (const data in MISSED_SCAN_REQUEST_PERMISSION) {
      await queryRunner.query(`
                INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'MISSED_SCAN_REQUEST'));
            `);
      await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = (get_permission_mpath('ATTENDANCE_MODULE,MISSED_SCAN_REQUEST,${data}'))
                WHERE name = '${data}';
            `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
