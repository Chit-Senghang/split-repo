import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedEmployeeReportPermission1701765836213
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    // EMPLOYEE BIRTHDAY PERMISSION
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'READ_EMPLOYEE_BIRTHDAY_REPORT', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('REPORT_MODULE, EMPLOYEE,READ_EMPLOYEE_BIRTHDAY_REPORT'))
        WHERE name = 'READ_EMPLOYEE_BIRTHDAY_REPORT';
    `);

    // EMPLOYEE POST PROBATION PERMISSION
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'READ_EMPLOYEE_POST_PROBATION_REPORT', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('REPORT_MODULE, EMPLOYEE,READ_EMPLOYEE_POST_PROBATION_REPORT'))
        WHERE name = 'READ_EMPLOYEE_POST_PROBATION_REPORT';
    `);

    // EMPLOYEE WORK ANNIVERSARY PERMISSION
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'READ_EMPLOYEE_WORK_ANNIVERSARY_REPORT', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('REPORT_MODULE, EMPLOYEE,READ_EMPLOYEE_WORK_ANNIVERSARY_REPORT'))
        WHERE name = 'READ_WORK_ANNIVERSARY_REPORT';
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
