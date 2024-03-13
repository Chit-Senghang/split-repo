import { MigrationInterface, QueryRunner } from 'typeorm';
import { STRUCTURE_POSITION_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/structure-position.enum';

export class seedCrudStructurePositionPermissionEmployee1672714025378
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                    INSERT INTO "permission" (version, "name",parent_id)
                    VALUES(2, 'STRUCTURE_POSITION', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
                `);

    await queryRunner.query(`
                UPDATE
                  "permission"
                SET
                  mpath = get_permission_mpath('EMPLOYEE_MODULE,STRUCTURE_POSITION')
                WHERE name = 'STRUCTURE_POSITION';
                `);

    for (const data in STRUCTURE_POSITION_PERMISSION) {
      await queryRunner.query(`
                    INSERT INTO "permission" (version, "name",parent_id)
                    VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'STRUCTURE_POSITION'));
                `);

      await queryRunner.query(`
                    UPDATE
                    "permission"
                    SET
                    mpath = (get_permission_mpath('EMPLOYEE_MODULE,STRUCTURE_POSITION,${data}'))
                    WHERE name = '${data}';
                `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
