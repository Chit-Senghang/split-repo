import { MigrationInterface, QueryRunner } from 'typeorm';
import { INSURANCE_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/insurance.enum';

export class employeeInsurancePermission1672131221314
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, 'INSURANCE', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
            `);

    await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = get_permission_mpath('EMPLOYEE_MODULE,INSURANCE')
                WHERE name = 'INSURANCE';
            `);

    for (const data in INSURANCE_PERMISSION) {
      await queryRunner.query(`
                      INSERT INTO "permission" (version, "name",parent_id)
                      VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'INSURANCE'));
                   `);
      await queryRunner.query(`
                      UPDATE
                      "permission"
                      SET
                      mpath = (get_permission_mpath('EMPLOYEE_MODULE,INSURANCE,${data}'))
                      WHERE name = '${data}';
                  `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
