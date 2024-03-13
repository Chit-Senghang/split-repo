import { MigrationInterface, QueryRunner } from 'typeorm';
import { COMPANY_STRUCTURE_COMPONENT_PERMISSION } from '../../shared-resources/ts/enum/permission';

export class RemoveUnusedPermission1686555134395 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // remove from role permission
    await queryRunner.manager.query(`
        DELETE FROM role_permission
          WHERE permission_id IN (
            SELECT id
            FROM "permission" p
            WHERE p."name" IN (
              'READ_EMPLOYEE_STATUS', 'CREATE_EMPLOYEE_STATUS', 'UPDATE_EMPLOYEE_STATUS', 'DELETE_EMPLOYEE_STATUS',
              'EMPLOYEE_STATUS', 'READ_JOB_TITLE', 'CREATE_JOB_TITLE', 'UPDATE_JOB_TITLE', 'DELETE_JOB_TITLE', 'JOB_TITLE',
              'READ_PAY_GRADE', 'CREATE_PAY_GRADE', 'UPDATE_PAY_GRADE', 'DELETE_PAY_GRADE', 'PAY_GRADE', 'READ_QUALIFICATION',
              'UPDATE_QUALIFICATION', 'CREATE_QUALIFICATION', 'DELETE_QUALIFICATION', 'QUALIFICATION',
              'STRUCTURE_POSITION', 'READ_STRUCTURE_POSITION', 'CREATE_STRUCTURE_POSITION', 'UPDATE_STRUCTURE_POSITION', 'DELETE_STRUCTURE_POSITION',
              'COMPANY', 'READ_COMPANY', 'CREATE_COMPANY', 'UPDATE_COMPANY', 'DELETE_COMPANY',
              'STRUCTURE_OUTLET', 'READ_STRUCTURE_OUTLET', 'CREATE_STRUCTURE_OUTLET', 'UPDATE_STRUCTURE_OUTLET', 'DELETE_STRUCTURE_OUTLET',
              'STRUCTURE_DEPARTMENT', 'READ_STRUCTURE_DEPARTMENT', 'CREATE_STRUCTURE_DEPARTMENT', 'UPDATE_STRUCTURE_DEPARTMENT', 'DELETE_STRUCTURE_DEPARTMENT',
              'STRUCTURE_LOCATION', 'READ_STRUCTURE_LOCATION', 'CREATE_STRUCTURE_LOCATION', 'UPDATE_STRUCTURE_LOCATION', 'DELETE_STRUCTURE_LOCATION'
          )
        );
      `);

    // remove (EMPLOYEE_STATUS, JOB_TITLE, PAY_GRADE, QUALIFICATION)
    await queryRunner.manager.query(`
        DELETE FROM permission WHERE name IN('READ_EMPLOYEE_STATUS', 'CREATE_EMPLOYEE_STATUS', 'UPDATE_EMPLOYEE_STATUS', 'DELETE_EMPLOYEE_STATUS', 'EMPLOYEE_STATUS');
        DELETE FROM permission WHERE name IN('READ_JOB_TITLE', 'CREATE_JOB_TITLE', 'UPDATE_JOB_TITLE', 'DELETE_JOB_TITLE', 'JOB_TITLE');
        DELETE FROM permission WHERE name IN('READ_PAY_GRADE', 'CREATE_PAY_GRADE', 'UPDATE_PAY_GRADE', 'DELETE_PAY_GRADE', 'PAY_GRADE');
        DELETE FROM permission WHERE name IN('READ_QUALIFICATION', 'UPDATE_QUALIFICATION', 'CREATE_QUALIFICATION', 'DELETE_QUALIFICATION', 'QUALIFICATION');
    `);

    // remove (STRUCTURE_POSITION, COMPANY, STRUCTURE_OUTLET, STRUCTURE_DEPARTMENT, STRUCTURE_LOCATION)
    await queryRunner.manager.query(`
        DELETE FROM permission WHERE name IN('STRUCTURE_POSITION', 'READ_STRUCTURE_POSITION', 'CREATE_STRUCTURE_POSITION', 'UPDATE_STRUCTURE_POSITION', 'DELETE_STRUCTURE_POSITION');
        DELETE FROM permission WHERE name IN('COMPANY', 'READ_COMPANY', 'CREATE_COMPANY', 'UPDATE_COMPANY', 'DELETE_COMPANY');
        DELETE FROM permission WHERE name IN('STRUCTURE_OUTLET', 'READ_STRUCTURE_OUTLET', 'CREATE_STRUCTURE_OUTLET', 'UPDATE_STRUCTURE_OUTLET', 'DELETE_STRUCTURE_OUTLET');
        DELETE FROM permission WHERE name IN('STRUCTURE_DEPARTMENT', 'READ_STRUCTURE_DEPARTMENT', 'CREATE_STRUCTURE_DEPARTMENT', 'UPDATE_STRUCTURE_DEPARTMENT', 'DELETE_STRUCTURE_DEPARTMENT');
        DELETE FROM permission WHERE name IN('STRUCTURE_LOCATION', 'READ_STRUCTURE_LOCATION', 'CREATE_STRUCTURE_LOCATION', 'UPDATE_STRUCTURE_LOCATION', 'DELETE_STRUCTURE_LOCATION');
    `);

    // add COMPANY_STRUCTURE_COMPONENT under EMPLOYEE_MODULE
    await queryRunner.query(`
      INSERT INTO "permission" (version, "name", parent_id)
      VALUES(0, 'COMPANY_STRUCTURE_COMPONENT', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
    `);

    await queryRunner.query(`
      UPDATE
        "permission"
      SET
        mpath = get_permission_mpath('EMPLOYEE_MODULE, COMPANY_STRUCTURE_COMPONENT')
      WHERE name = 'COMPANY_STRUCTURE_COMPONENT';
    `);

    for (const data in COMPANY_STRUCTURE_COMPONENT_PERMISSION) {
      await queryRunner.query(`
          INSERT INTO "permission" (version, "name", parent_id)
          VALUES(0, '${data}', (SELECT id FROM "permission" WHERE name = 'COMPANY_STRUCTURE_COMPONENT'));
      `);

      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('EMPLOYEE_MODULE, COMPANY_STRUCTURE_COMPONENT, ${data}'))
        WHERE name = '${data}';
    `);
    }

    // group permission and change level under ATTENDANCE_MODULE
    const attendanceParentId: number = await queryRunner.manager.query(
      `SELECT id FROM permission WHERE name = 'ATTENDANCE_MODULE'`
    );

    const attendanceGroups = [
      {
        name: 'EMPLOYEE_WORKING_SCHEDULE',
        sub: {
          READ_EMPLOYEE_WORKING_SCHEDULE: 'READ_EMPLOYEE_WORKING_SCHEDULE',
          CREATE_EMPLOYEE_WORKING_SCHEDULE: 'CREATE_EMPLOYEE_WORKING_SCHEDULE',
          UPDATE_EMPLOYEE_WORKING_SCHEDULE: 'UPDATE_EMPLOYEE_WORKING_SCHEDULE',
          DELETE_EMPLOYEE_WORKING_SCHEDULE: 'DELETE_EMPLOYEE_WORKING_SCHEDULE'
        }
      },
      {
        name: 'FINGER_PRINT_DEVICE',
        sub: {
          READ_FINGER_PRINT_DEVICE: 'READ_FINGER_PRINT_DEVICE',
          CREATE_FINGER_PRINT_DEVICE: 'CREATE_FINGER_PRINT_DEVICE',
          UPDATE_FINGER_PRINT_DEVICE: 'UPDATE_FINGER_PRINT_DEVICE',
          DELETE_FINGER_PRINT_DEVICE: 'DELETE_FINGER_PRINT_DEVICE'
        }
      },
      {
        name: 'ATTENDANCE_REPORT',
        sub: {
          READ_ATTENDANCE_REPORT: 'READ_ATTENDANCE_REPORT',
          CREATE_ATTENDANCE_REPORT: 'CREATE_ATTENDANCE_REPORT',
          UPDATE_ATTENDANCE_REPORT: 'UPDATE_ATTENDANCE_REPORT',
          DELETE_ATTENDANCE_REPORT: 'DELETE_ATTENDANCE_REPORT'
        }
      }
    ];

    // update sub parents
    for (const attendanceGroup of attendanceGroups) {
      await queryRunner.manager.query(`
        UPDATE permission
        SET parent_id = '${attendanceParentId[0].id}',
        mpath = get_permission_mpath('ATTENDANCE_MODULE, ${attendanceGroup.name}')
        WHERE name = '${attendanceGroup.name}';
      `);

      // find sub parent
      const attendanceSubParentId: number = await queryRunner.manager.query(`
        SELECT id FROM permission WHERE name = '${attendanceGroup.name}'
      `);

      // update sub chiles by parents
      for (const attendanceChild in attendanceGroup.sub) {
        await queryRunner.manager.query(`
              UPDATE permission
              SET parent_id = '${attendanceSubParentId[0].id}',
              mpath = (get_permission_mpath('ATTENDANCE_MODULE, ${attendanceGroup.name}, ${attendanceChild}'))
              WHERE name = '${attendanceChild}';
          `);
      }
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
