import { MigrationInterface, QueryRunner } from 'typeorm';
import { PUBLIC_HOLIDAY_PERMISSION } from '../../shared-resources/ts/enum/permission';

export class seedPermissionPublicHolidayPermission1674123558114
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                    INSERT INTO "permission" (version, "name",parent_id)
                    VALUES(2, 'PUBLIC_HOLIDAY', (SELECT id FROM "permission" WHERE name = 'ATTENDANCE_MODULE'));
                `);

    await queryRunner.query(`
                    UPDATE
                    "permission"
                    SET
                    mpath = get_permission_mpath('ATTENDANCE_MODULE,PUBLIC_HOLIDAY')
                    WHERE name = 'PUBLIC_HOLIDAY';
                `);

    for (const data in PUBLIC_HOLIDAY_PERMISSION) {
      await queryRunner.query(`
                    INSERT INTO "permission" (version, "name",parent_id)
                    VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'PUBLIC_HOLIDAY'));
                `);
      await queryRunner.query(`
                    UPDATE
                    "permission"
                    SET
                    mpath = (get_permission_mpath('ATTENDANCE_MODULE,PUBLIC_HOLIDAY,${data}'))
                    WHERE name = '${data}';
                `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
