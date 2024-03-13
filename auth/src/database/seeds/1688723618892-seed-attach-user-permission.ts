import { MigrationInterface, QueryRunner } from 'typeorm';
import { ATTACH_USER_TO_EMPLOYEE_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-master-information.enum';

export class SeedAttachUserPermission1688723618892
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${ATTACH_USER_TO_EMPLOYEE_PERMISSION.ATTACH_USER_TO_EMPLOYEE}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MASTER_INFORMATION'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_MASTER_DATA,${ATTACH_USER_TO_EMPLOYEE_PERMISSION.ATTACH_USER_TO_EMPLOYEE}'))
        WHERE name = '${ATTACH_USER_TO_EMPLOYEE_PERMISSION.ATTACH_USER_TO_EMPLOYEE}';
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
