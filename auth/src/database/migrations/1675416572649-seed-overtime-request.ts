import { MigrationInterface, QueryRunner } from 'typeorm';
import { OVERTIME_REQUEST_PERMISSION } from '../../shared-resources/ts/enum/permission/attendance/overtime-request.enum';

export class seedOvertimeRequest1675416572649 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, 'OVERTIME_REQUEST', (SELECT id FROM "permission" WHERE name = 'ATTENDANCE_MODULE'));
            `);

    await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = get_permission_mpath('ATTENDANCE_MODULE,OVERTIME_REQUEST')
                WHERE name = 'OVERTIME_REQUEST';
            `);

    for (const data in OVERTIME_REQUEST_PERMISSION) {
      await queryRunner.query(`
                    INSERT INTO "permission" (version, "name",parent_id)
                    VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'OVERTIME_REQUEST'));
                `);
      await queryRunner.query(`
                    UPDATE
                    "permission"
                    SET
                    mpath = (get_permission_mpath('ATTENDANCE_MODULE,OVERTIME_REQUEST,${data}'))
                    WHERE name = '${data}';
                `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
