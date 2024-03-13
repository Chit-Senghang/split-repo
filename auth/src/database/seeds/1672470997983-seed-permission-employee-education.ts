import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_EDUCATION_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-education.enum';

export class seedPermissionEmployeeEducation1672470997983
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //* EMPLOYEE_EDUCATION MODULE
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'EMPLOYEE_EDUCATION', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_EDUCATION')
        WHERE name = 'EMPLOYEE_EDUCATION';
    `);
    for (const data in EMPLOYEE_EDUCATION_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_EDUCATION'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_EDUCATION,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
