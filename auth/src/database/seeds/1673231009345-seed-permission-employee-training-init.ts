import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_TRAINING_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-training.enum';

export class seedPermissionEmployeeTrainingInit1673231009345
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'EMPLOYEE_TRAINING', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_TRAINING')
        WHERE name = 'EMPLOYEE_TRAINING';
    `);

    for (const data in EMPLOYEE_TRAINING_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_TRAINING'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_TRAINING,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
