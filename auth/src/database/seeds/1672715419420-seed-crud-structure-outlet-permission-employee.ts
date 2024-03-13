import { MigrationInterface, QueryRunner } from 'typeorm';
import { STRUCTURE_OUTLET_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/structure-outlet.enum';

export class seedCrudStructureOutletPermissionEmployee1672715419420
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'STRUCTURE_OUTLET', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);

    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('EMPLOYEE_MODULE,STRUCTURE_OUTLET')
        WHERE name = 'STRUCTURE_OUTLET';
        `);

    for (const data in STRUCTURE_OUTLET_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'STRUCTURE_OUTLET'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,STRUCTURE_OUTLET,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
