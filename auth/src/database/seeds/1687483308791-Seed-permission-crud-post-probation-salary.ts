import { MigrationInterface, QueryRunner } from 'typeorm';
import { CRUD_PAYROLL_POST_PROBATION_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/crud-payroll-post-probation.enum';

export class SeedPermissionCrudPostProbationSalary1687483308791
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, 'CRUD_PAYROLL_POST_PROBATION', (SELECT id FROM "permission" WHERE name = 'PAYROLL_MODULE'));
            `);

    await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = get_permission_mpath('PAYROLL_MODULE,CRUD_PAYROLL_POST_PROBATION')
                WHERE name = 'CRUD_PAYROLL_POST_PROBATION';
            `);

    for (const data in CRUD_PAYROLL_POST_PROBATION_PERMISSION) {
      await queryRunner.query(`
                INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'CRUD_PAYROLL_POST_PROBATION'));
            `);
      await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = (get_permission_mpath('PAYROLL_MODULE, CRUD_PAYROLL_POST_PROBATION,${data}'))
                WHERE name = '${data}';
            `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
