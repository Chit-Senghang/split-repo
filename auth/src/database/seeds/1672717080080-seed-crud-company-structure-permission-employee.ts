import { MigrationInterface, QueryRunner } from 'typeorm';
import { COMPANY_STRUCTURE_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-company-structure.enum';

export class seedCrudCompanyStructurePermissionEmployee1672717080080
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'COMPANY_STRUCTURE', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('EMPLOYEE_MODULE,COMPANY_STRUCTURE')
            WHERE name = 'COMPANY_STRUCTURE';
        `);

    for (const data in COMPANY_STRUCTURE_PERMISSION) {
      await queryRunner.query(`
                  INSERT INTO "permission" (version, "name",parent_id)
                  VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'COMPANY_STRUCTURE'));
               `);
      await queryRunner.query(`
                  UPDATE
                  "permission"
                  SET
                  mpath = (get_permission_mpath('EMPLOYEE_MODULE,COMPANY_STRUCTURE,${data}'))
                  WHERE name = '${data}';
              `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
