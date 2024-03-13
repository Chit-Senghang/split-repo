import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_CONTACT_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-contact.enum';

export class seedPermissionEmployeeContact1672288120737
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    //* EMPLOYEE_CONTACT MODULE
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'EMPLOYEE_CONTACT', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_CONTACT')
        WHERE name = 'EMPLOYEE_CONTACT';
    `);
    for (const data in EMPLOYEE_CONTACT_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_CONTACT'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_CONTACT,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
