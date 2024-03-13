import { MigrationInterface, QueryRunner } from 'typeorm';
import { PositionLevelPermissionEnum } from '../../shared-resources/ts/enum/permission/employee/position-level.enum';

export class seedCrudPositionLevelPermissionEmployee1672728357008
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, 'POSITION_LEVEL', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
            `);

    await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = get_permission_mpath('EMPLOYEE_MODULE,POSITION_LEVEL')
                WHERE name = 'POSITION_LEVEL';
            `);

    for (const data in PositionLevelPermissionEnum) {
      await queryRunner.query(`
                      INSERT INTO "permission" (version, "name",parent_id)
                      VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'POSITION_LEVEL'));
                   `);
      await queryRunner.query(`
                      UPDATE
                      "permission"
                      SET
                      mpath = (get_permission_mpath('EMPLOYEE_MODULE,POSITION_LEVEL,${data}'))
                      WHERE name = '${data}';
                  `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
