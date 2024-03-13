import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_LANGUAGE_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-language.enum';

export class seedPermissionEmployeeLanguage1673158837817
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'EMPLOYEE_LANGUAGE', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_LANGUAGE')
        WHERE name = 'EMPLOYEE_LANGUAGE';
    `);

    for (const data in EMPLOYEE_LANGUAGE_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_LANGUAGE'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_LANGUAGE,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
