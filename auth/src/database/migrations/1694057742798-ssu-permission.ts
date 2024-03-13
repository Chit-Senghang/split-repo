import { MigrationInterface, QueryRunner } from 'typeorm';

export class SsuPermission1694057742798 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "role" ADD "is_system_defined" BOOLEAN DEFAULT (FALSE);
    `);

    const essRole = await queryRunner.query(
      `INSERT INTO "role" 
           ("version", "name", description, updated_by, created_by, created_at, updated_at, deleted_at, is_system_defined) 
    VALUES (1, 'ESS User', 'manage some module', NULL, NULL, now(), now(), NULL, true) RETURNING id;`
    );

    const ssuPermission = await queryRunner.query(
      `SELECT id,name FROM "permission" WHERE "name" IN(

          'READ_ALL_FUNCTION',
          'READ_EMPLOYEE_MASTER_INFORMATION',

          'READ_REQUEST_APPROVAL_WORKFLOW',
          'CREATE_REQUEST_APPROVAL_WORKFLOW',
          'UPDATE_REQUEST_APPROVAL_WORKFLOW',
          
          'READ_EMPLOYEE_MOVEMENT',
          'CREATE_EMPLOYEE_MOVEMENT',
          'UPDATE_EMPLOYEE_MOVEMENT',
          'DELETE_EMPLOYEE_MOVEMENT',
          
          'READ_EMPLOYEE_RESIGNATION',
          'CREATE_EMPLOYEE_RESIGNATION',
          'UPDATE_EMPLOYEE_RESIGNATION',
          'DELETE_EMPLOYEE_RESIGNATION',
          
          'READ_EMPLOYEE_WARNING',
          'CREATE_EMPLOYEE_WARNING',
          'UPDATE_EMPLOYEE_WARNING',
          'DELETE_EMPLOYEE_WARNING',
            
          'READ_MISSED_SCAN_REQUEST',
          'CREATE_MISSED_SCAN_REQUEST',
          'UPDATE_MISSED_SCAN_REQUEST',
          'DELETE_MISSED_SCAN_REQUEST',
          
          'READ_OVERTIME_REQUEST',
          'CREATE_OVERTIME_REQUEST',
          'UPDATE_OVERTIME_REQUEST',
          'DELETE_OVERTIME_REQUEST',
          
          'READ_EMPLOYEE_WORKING_SCHEDULE',
          'CREATE_EMPLOYEE_WORKING_SCHEDULE',
          'UPDATE_EMPLOYEE_WORKING_SCHEDULE',
          'DELETE_EMPLOYEE_WORKING_SCHEDULE',

          'READ_ATTENDANCE_RECORD',
          
          'READ_MISSION_REQUEST',
          'CREATE_MISSION_REQUEST',
          'UPDATE_MISSION_REQUEST',
          'DELETE_MISSION_REQUEST',
          
          'READ_DAY_OFF_REQUEST',
          'CREATE_DAY_OFF_REQUEST',
          'UPDATE_DAY_OFF_REQUEST',
          'DELETE_DAY_OFF_REQUEST',

          'READ_LEAVE_REQUEST',
          'CREATE_LEAVE_REQUEST',
          'UPDATE_LEAVE_REQUEST',
          'DELETE_LEAVE_REQUEST'
    );`
    );

    for (const permission of ssuPermission) {
      await queryRunner.query(
        `INSERT INTO "role_permission" 
                 ("version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
          VALUES (1,${essRole[0].id},${permission.id}, NULL, NULL, now(), now(), NULL);`
      );
    }
  }

  async down(): Promise<void> {
    return;
  }
}
