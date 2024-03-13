import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_INSURANCE_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-insurance.enum';

export class seedPermissionEmployeeInsurance1672373864258
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'EMPLOYEE_INSURANCE', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_INSURANCE')
        WHERE name = 'EMPLOYEE_INSURANCE';
    `);

    for (const data in EMPLOYEE_INSURANCE_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_INSURANCE'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_INSURANCE,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
