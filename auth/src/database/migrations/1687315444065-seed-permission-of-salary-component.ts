import { MigrationInterface, QueryRunner } from 'typeorm';
import { SALARY_COMPONENT_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/salary-component.enum';

export class SeedPermissionOfSalaryComponent1687315444065
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'SALARY_COMPONENT', (SELECT id FROM "permission" WHERE name = 'ADMIN'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('ADMIN,SALARY_COMPONENT')
            WHERE name = 'SALARY_COMPONENT';
        `);

    for (const data in SALARY_COMPONENT_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'SALARY_COMPONENT'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('ADMIN, SALARY_COMPONENT,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
