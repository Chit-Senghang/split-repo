import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_VACCINATION_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-vaccination.enum';

export class seedPermissionEmployeeVaccination1672391215041
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'EMPLOYEE_VACCINATION', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_VACCINATION')
        WHERE name = 'EMPLOYEE_VACCINATION';
    `);
    for (const data in EMPLOYEE_VACCINATION_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_VACCINATION'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_VACCINATION,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
