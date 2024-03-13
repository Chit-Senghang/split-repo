import { MigrationInterface, QueryRunner } from 'typeorm';
import { BORROW_OR_PAYBACK_PERMISSION } from '../../shared-resources/ts/enum/permission/attendance/borrow-or-payback.enum';

export class seedPermissionBorrowOrPayback1675324018925
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'BORROW_OR_PAYBACK', (SELECT id FROM "permission" WHERE name = 'ATTENDANCE_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('ATTENDANCE_MODULE,BORROW_OR_PAYBACK')
            WHERE name = 'BORROW_OR_PAYBACK';
        `);

    for (const data in BORROW_OR_PAYBACK_PERMISSION) {
      await queryRunner.query(`
                INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'BORROW_OR_PAYBACK'));
            `);
      await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = (get_permission_mpath('ATTENDANCE_MODULE,BORROW_OR_PAYBACK,${data}'))
                WHERE name = '${data}';
            `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
