import { MigrationInterface, QueryRunner } from 'typeorm';
import { STRUCTURE_DEPARTMENT_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/structure-department.enum';

export class seedCrudStructureDepartmentPermissionEmployee1672716079022
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, 'STRUCTURE_DEPARTMENT', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
            `);

    await queryRunner.query(`
            UPDATE
              "permission"
            SET
              mpath = get_permission_mpath('EMPLOYEE_MODULE,STRUCTURE_DEPARTMENT')
            WHERE name = 'STRUCTURE_DEPARTMENT';
            `);

    for (const data in STRUCTURE_DEPARTMENT_PERMISSION) {
      await queryRunner.query(`
                INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'STRUCTURE_DEPARTMENT'));
            `);

      await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = (get_permission_mpath('EMPLOYEE_MODULE,STRUCTURE_DEPARTMENT,${data}'))
                WHERE name = '${data}';
            `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
