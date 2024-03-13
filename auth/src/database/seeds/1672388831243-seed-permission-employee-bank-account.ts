import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_BANK_ACCOUNT_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-bank-account.enum';

export class seedPermissionEmployeeBankAccount1672388831243
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //* EMPLOYEE_BANK_ACCOUNT MODULE
    await queryRunner.query(`
    INSERT INTO "permission" (version, "name",parent_id)
    VALUES(2, 'EMPLOYEE_BANK_ACCOUNT', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_BANK_ACCOUNT')
        WHERE name = 'EMPLOYEE_BANK_ACCOUNT';
    `);
    for (const data in EMPLOYEE_BANK_ACCOUNT_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_BANK_ACCOUNT'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_BANK_ACCOUNT,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
