import { MigrationInterface, QueryRunner } from 'typeorm';
import { employeeResignationAndDayOffRequests } from '../../shared-resources/permission/employee-resignation-day-off-request-permission';

export class MissingEmployeeResignationDayOffRequest1687323468062
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // update EMPLOYEE_RESIGNATION to EMPLOYEE_MOVEMENT
    await queryRunner.query(`
        UPDATE permission SET name = 'EMPLOYEE_MOVEMENT' WHERE name = (SELECT name FROM permission WHERE name = 'EMPLOYEE_RESIGNATION');
    `);
    for (const employeeResignationAndDayOffRequest of employeeResignationAndDayOffRequests) {
      // insert employee-resignation and day-off-request
      await queryRunner.query(`
      INSERT INTO "permission" (version, "name", parent_id)
          VALUES(0, '${employeeResignationAndDayOffRequest.sub.name}', (SELECT id FROM "permission" WHERE name = '${employeeResignationAndDayOffRequest.name}'));
      `);

      // update sub parent
      await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = concat(get_permission_mpath('${employeeResignationAndDayOffRequest.name}'), get_permission_mpath('${employeeResignationAndDayOffRequest.sub.name}'))
        WHERE name = '${employeeResignationAndDayOffRequest.sub.name}';
    `);

      // insert and update chiles
      for (const data in employeeResignationAndDayOffRequest.sub.sub) {
        await queryRunner.query(`
          INSERT INTO "permission" (version, "name", parent_id)
          VALUES(0, '${data}', (SELECT id FROM "permission" WHERE name = '${employeeResignationAndDayOffRequest.sub.name}'));
      `);

        await queryRunner.query(`
          UPDATE
            "permission"
          SET
            mpath = concat(get_permission_mpath('${employeeResignationAndDayOffRequest.name}'), get_permission_mpath('${employeeResignationAndDayOffRequest.sub.name}'), get_permission_mpath('${data}'))
          WHERE name = '${data}';
      `);
      }
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
