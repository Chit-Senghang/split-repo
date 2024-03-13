import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedWorkingSchedulePermission1685181999927
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into "permission" ("name", "version")
        values ('EMPLOYEE_WORKING_SCHEDULE', 1);
    
        insert into "permission" ("name", "version")
        values ('READ_EMPLOYEE_WORKING_SCHEDULE', 1);
    
        insert into "permission" ("name", "version")
        values ('UPDATE_EMPLOYEE_WORKING_SCHEDULE', 1);
    
        insert into "permission" ("name", "version")
        values ('CREATE_EMPLOYEE_WORKING_SCHEDULE', 1);
    
        insert into "permission" ("name", "version")
        values ('DELETE_EMPLOYEE_WORKING_SCHEDULE', 1);
    
        update "permission"
        set mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_WORKING_SCHEDULE')
        where "name" = 'EMPLOYEE_WORKING_SCHEDULE';
    
        update "permission"
        set mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_WORKING_SCHEDULE,READ_EMPLOYEE_WORKING_SCHEDULE')
        where "name" = 'READ_EMPLOYEE_WORKING_SCHEDULE';
    
        update "permission"
        set mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_WORKING_SCHEDULE,UPDATE_EMPLOYEE_WORKING_SCHEDULE')
        where "name" = 'UPDATE_EMPLOYEE_WORKING_SCHEDULE';
    
        update "permission"
        set mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_WORKING_SCHEDULE,CREATE_EMPLOYEE_WORKING_SCHEDULE')
        where "name" = 'CREATE_EMPLOYEE_WORKING_SCHEDULE';
    
        update "permission"
        set mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_WORKING_SCHEDULE,DELETE_EMPLOYEE_WORKING_SCHEDULE')
        where "name" = 'DELETE_EMPLOYEE_WORKING_SCHEDULE';
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
