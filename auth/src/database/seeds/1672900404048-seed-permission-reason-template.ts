import { MigrationInterface, QueryRunner } from 'typeorm';
import { REASON_TEPLATE_PERMISSION } from '../../shared-resources/ts/enum/permission/authentication/reason-template.enum';

export class seedPermissionReasonTemplate1672900404048
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'REASON_TEPLATE', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,REASON_TEPLATE')
        WHERE name = 'REASON_TEPLATE';
    `);

    for (const data in REASON_TEPLATE_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'REASON_TEPLATE'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,REASON_TEPLATE,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
