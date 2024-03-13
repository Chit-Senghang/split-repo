import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_PAYMENT_METHOD_ACCOUNT_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-bank-account.enum';

export class DropPermissionCrudEmployeeBankAccountAddNewPermissionCrud1689067921595
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
    DELETE FROM role_permission
      WHERE permission_id IN (
        SELECT id
        FROM "permission" p
        WHERE p."name" IN (
          'READ_EMPLOYEE_BANK_ACCOUNT', 'CREATE_EMPLOYEE_BANK_ACCOUNT', 'UPDATE_EMPLOYEE_BANK_ACCOUNT', 'DELETE_EMPLOYEE_BANK_ACCOUNT', 'EMPLOYEE_BANK_ACCOUNT'
      )
    );
  `);
    await queryRunner.manager.query(`
        DELETE FROM permission WHERE name IN('READ_EMPLOYEE_BANK_ACCOUNT','CREATE_EMPLOYEE_BANK_ACCOUNT','UPDATE_EMPLOYEE_BANK_ACCOUNT','DELETE_EMPLOYEE_BANK_ACCOUNT','EMPLOYEE_BANK_ACCOUNT');
    `);

    await queryRunner.query(`
    INSERT INTO "permission" (version, "name",parent_id)
    VALUES(2, 'EMPLOYEE_PAYMENT_METHOD_ACCOUNT', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_PAYMENT_METHOD_ACCOUNT')
        WHERE name = 'EMPLOYEE_PAYMENT_METHOD_ACCOUNT';
    `);
    for (const data in EMPLOYEE_PAYMENT_METHOD_ACCOUNT_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_PAYMENT_METHOD_ACCOUNT'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_PAYMENT_METHOD_ACCOUNT,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
