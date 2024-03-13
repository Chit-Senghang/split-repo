import { MigrationInterface, QueryRunner } from 'typeorm';
import { WORKING_SHIFT_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/working-shift.enum';
import { WORKSHIFT_TYPE_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/workshift-type.enum';

export class seedPermissionWorkshift1672557404765
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    //* WORKSHIFT_TYPE MODULE
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'WORKSHIFT_TYPE', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,WORKSHIFT_TYPE')
        WHERE name = 'WORKSHIFT_TYPE';
    `);
    for (const data in WORKSHIFT_TYPE_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'WORKSHIFT_TYPE'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,WORKSHIFT_TYPE,${data}'))
        WHERE name = '${data}';
    `);
    }
    //* WORKING_SHIFT MODULE
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'WORKING_SHIFT', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,WORKING_SHIFT')
        WHERE name = 'WORKING_SHIFT';
    `);
    for (const data in WORKING_SHIFT_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'WORKING_SHIFT'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,WORKING_SHIFT,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
