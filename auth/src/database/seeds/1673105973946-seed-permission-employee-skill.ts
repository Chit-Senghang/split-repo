import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_SKILL_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-skill.enum';

export class seedPermissionEmployeeSkill1673105973946
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //* EMPLOYEE_SKILL MODULE
    await queryRunner.query(`
    INSERT INTO "permission" (version, "name",parent_id)
    VALUES(2, 'EMPLOYEE_SKILL', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
`);
    await queryRunner.query(`
    UPDATE
    "permission"
    SET
    mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_SKILL')
    WHERE name = 'EMPLOYEE_SKILL';
`);
    for (const data in EMPLOYEE_SKILL_PERMISSION) {
      await queryRunner.query(`
    INSERT INTO "permission" (version, "name",parent_id)
    VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_SKILL'));
`);
      await queryRunner.query(`
    UPDATE
    "permission"
    SET
    mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_SKILL,${data}'))
    WHERE name = '${data}';
`);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
