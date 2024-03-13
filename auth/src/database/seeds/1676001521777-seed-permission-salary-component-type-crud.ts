import { MigrationInterface, QueryRunner } from 'typeorm';
import { SALARY_COMPONENT_TYPE_PERMISSION } from '../../shared-resources/ts/enum/permission/payroll/salary-component-type.enum';

export class seedPermissionSalaryComponentTypeCrud1676001521777
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'SALARY_COMPONENT_TYPE', (SELECT id FROM "permission" WHERE name = 'PAYROLL_MODULE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('PAYROLL_MODULE,SALARY_COMPONENT_TYPE')
        WHERE name = 'SALARY_COMPONENT_TYPE';
    `);

    for (const data in SALARY_COMPONENT_TYPE_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'SALARY_COMPONENT_TYPE'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('PAYROLL_MODULE,SALARY_COMPONENT_TYPE,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
