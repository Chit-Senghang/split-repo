import { MigrationInterface, QueryRunner } from 'typeorm';
import { STRUCTURE_LOCATION_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/structure-location.enum';

export class seedCrudStructureLocationPermissionEmployee1672716351622
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, 'STRUCTURE_LOCATION', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
            `);

    await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = get_permission_mpath('EMPLOYEE_MODULE,STRUCTURE_LOCATION')
                WHERE name = 'STRUCTURE_LOCATION';
            `);

    for (const data in STRUCTURE_LOCATION_PERMISSION) {
      await queryRunner.query(`
                      INSERT INTO "permission" (version, "name",parent_id)
                      VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'STRUCTURE_LOCATION'));
                   `);
      await queryRunner.query(`
                      UPDATE
                      "permission"
                      SET
                      mpath = (get_permission_mpath('EMPLOYEE_MODULE,STRUCTURE_LOCATION,${data}'))
                      WHERE name = '${data}';
                  `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
