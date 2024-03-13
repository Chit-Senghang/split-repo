import { MigrationInterface, QueryRunner } from 'typeorm';
import { GEOGRAPHIC_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/geographic.enum';

export class seedPermissionGeographic1672710464139
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'GEOGRAPHIC', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,GEOGRAPHIC')
        WHERE name = 'GEOGRAPHIC';
    `);

    for (const data in GEOGRAPHIC_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'GEOGRAPHIC'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,GEOGRAPHIC,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
