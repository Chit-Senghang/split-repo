import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_IDENTIFIER_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-identifier.enum';

export class seedPermissionEmployeeIdentifier1672464007586
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //* EMPLOYEE_IDENTIFIER MODULE
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'EMPLOYEE_IDENTIFIER', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_IDENTIFIER')
        WHERE name = 'EMPLOYEE_IDENTIFIER';
    `);
    for (const data in EMPLOYEE_IDENTIFIER_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_IDENTIFIER'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_IDENTIFIER,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
