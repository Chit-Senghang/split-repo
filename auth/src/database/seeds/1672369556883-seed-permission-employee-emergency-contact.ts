import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMPLOYEE_EMERGENCY_CONTACT_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/employee-emergency-contact.enum';

export class seedPermissionEmployeeEmergencyContact1672369556883
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //* EMPLOYEE_EMERGENCY_CONTACT MODULE
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'EMPLOYEE_EMERGENCY_CONTACT', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_EMERGENCY_CONTACT')
        WHERE name = 'EMPLOYEE_EMERGENCY_CONTACT';
    `);
    for (const data in EMPLOYEE_EMERGENCY_CONTACT_PERMISSION) {
      await queryRunner.query(`
          INSERT INTO "permission" (version, "name",parent_id)
          VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_EMERGENCY_CONTACT'));
      `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_EMERGENCY_CONTACT,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
