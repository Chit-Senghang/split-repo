import { MigrationInterface, QueryRunner } from 'typeorm';
import { PAYMENT_METHOD_PERMISSION } from '../../shared-resources/ts/enum/permission';

export class SeedCrudPermissionPaymentMethod1689045617197
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'PAYMENT_METHOD', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('EMPLOYEE_MODULE,PAYMENT_METHOD')
            WHERE name = 'PAYMENT_METHOD';
        `);

    for (const data in PAYMENT_METHOD_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'PAYMENT_METHOD'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,PAYMENT_METHOD,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
