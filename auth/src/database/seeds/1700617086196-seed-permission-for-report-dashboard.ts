import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPermissionForReportDashboard1700617086196
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name")
            VALUES (2, 'REPORT_MODULE');
        `);
    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('REPORT_MODULE')
            WHERE name = 'REPORT_MODULE';
    `);

    await queryRunner.query(`
    INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'EMPLOYEE', (SELECT id FROM "permission" WHERE name = 'REPORT_MODULE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('REPORT_MODULE,EMPLOYEE')
        WHERE name = 'EMPLOYEE';
    `);

    // attendance
    await queryRunner.query(`
    INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'ATTENDANCE', (SELECT id FROM "permission" WHERE name = 'REPORT_MODULE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('REPORT_MODULE,ATTENDANCE')
        WHERE name = 'ATTENDANCE';
    `);

    // leave
    await queryRunner.query(`
     INSERT INTO "permission" (version, "name",parent_id)
         VALUES(2, 'LEAVE', (SELECT id FROM "permission" WHERE name = 'REPORT_MODULE'));
     `);

    await queryRunner.query(`
         UPDATE
         "permission"
         SET
         mpath = get_permission_mpath('REPORT_MODULE,LEAVE')
         WHERE name = 'LEAVE';
     `);

    const READ_REPORT_EMPLOYEE_PERMISSION = {
      READ_REPORT_TOTAL_EMPLOYEE: 'READ_REPORT_TOTAL_EMPLOYEE',
      READ_REPORT_EMPLOYEE_MOVEMENT: 'READ_REPORT_EMPLOYEE_MOVEMENT',
      READ_REPORT_EMPLOYEE_TURNOVER: 'READ_REPORT_EMPLOYEE_TURNOVER',
      READ_REPORT_EMPLOYEE_REMINDER: 'READ_REPORT_EMPLOYEE_REMINDER',
      READ_REPORT_EMPLOYEE_PERSONAL_INFORMATION:
        'READ_REPORT_EMPLOYEE_PERSONAL_INFORMATION',
      READ_REPORT_TOTAL_EMPLOYEE_BY_LOCATION_STORE:
        'READ_REPORT_TOTAL_EMPLOYEE_BY_LOCATION_STORE',
      READ_REPORT_REQUEST_APPROVAL_REPORT: 'READ_REPORT_REQUEST_APPROVAL_REPORT'
    } as const;

    // seed EMPLOYEE
    for (const reportEmployee in READ_REPORT_EMPLOYEE_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${reportEmployee}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('REPORT_MODULE, EMPLOYEE,${reportEmployee}'))
        WHERE name = '${reportEmployee}';
    `);
    }

    const READ_REPORT_ATTENDANCE_PERMISSION = {
      READ_REPORT_EMPLOYEE_ATTENDANCE: 'READ_REPORT_EMPLOYEE_ATTENDANCE',
      READ_REPORT_ATTENDANCE_REMINDER: 'READ_REPORT_ATTENDANCE_REMINDER'
    } as const;

    // seed ATTENDANCE
    for (const reportAttendance in READ_REPORT_ATTENDANCE_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${reportAttendance}', (SELECT id FROM "permission" WHERE name = 'ATTENDANCE'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('REPORT_MODULE, ATTENDANCE,${reportAttendance}'))
        WHERE name = '${reportAttendance}';
    `);
    }

    const READ_REPORT_LEAVE_PERMISSION = {
      READ_REPORT_LEAVE_REMAINING: 'READ_REPORT_LEAVE_REMAINING'
    } as const;

    // seed LEAVE
    for (const reportLeave in READ_REPORT_LEAVE_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${reportLeave}', (SELECT id FROM "permission" WHERE name = 'LEAVE'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('REPORT_MODULE, LEAVE,${reportLeave}'))
        WHERE name = '${reportLeave}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
