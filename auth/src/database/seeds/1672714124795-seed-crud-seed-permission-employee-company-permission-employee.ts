import { MigrationInterface, QueryRunner } from 'typeorm';
import { COMPANY_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/company.enum';

export class seedCrudSeedPermissionEmployeeCompanyPermissionEmployee1672714124795
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                            INSERT INTO "permission" (version, "name",parent_id)
                            VALUES(2, 'COMPANY', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
                        `);

    await queryRunner.query(`
                        UPDATE
                          "permission"
                        SET
                          mpath = get_permission_mpath('EMPLOYEE_MODULE,COMPANY')
                        WHERE name = 'COMPANY';
                        `);

    for (const data in COMPANY_PERMISSION) {
      await queryRunner.query(`
                            INSERT INTO "permission" (version, "name",parent_id)
                            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'COMPANY'));
                        `);

      await queryRunner.query(`
                            UPDATE
                            "permission"
                            SET
                            mpath = (get_permission_mpath('EMPLOYEE_MODULE,COMPANY,${data}'))
                            WHERE name = '${data}';
                        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
