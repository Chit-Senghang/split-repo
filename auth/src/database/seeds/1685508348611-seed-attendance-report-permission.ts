import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAttendanceReportPermission1685508348611
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into "permission" ("name", "version")
        values ('ATTENDANCE_REPORT', 1);
    
        insert into "permission" ("name", "version")
        values ('READ_ATTENDANCE_REPORT', 1);
    
        insert into "permission" ("name", "version")
        values ('UPDATE_ATTENDANCE_REPORT', 1);
    
        insert into "permission" ("name", "version")
        values ('CREATE_ATTENDANCE_REPORT', 1);
    
        insert into "permission" ("name", "version")
        values ('DELETE_ATTENDANCE_REPORT', 1);
    
        update "permission"
        set mpath = get_permission_mpath('ATTENDANCE_MODULE,ATTENDANCE_REPORT')
        where "name" = 'ATTENDANCE_REPORT';
    
        update "permission"
        set mpath = get_permission_mpath('ATTENDANCE_MODULE,ATTENDANCE_REPORT,READ_ATTENDANCE_REPORT')
        where "name" = 'READ_ATTENDANCE_REPORT';
    
        update "permission"
        set mpath = get_permission_mpath('ATTENDANCE_MODULE,ATTENDANCE_REPORT,UPDATE_ATTENDANCE_REPORT')
        where "name" = 'UPDATE_ATTENDANCE_REPORT';
    
        update "permission"
        set mpath = get_permission_mpath('ATTENDANCE_MODULE,ATTENDANCE_REPORT,CREATE_ATTENDANCE_REPORT')
        where "name" = 'CREATE_ATTENDANCE_REPORT';
    
        update "permission"
        set mpath = get_permission_mpath('ATTENDANCE_MODULE,ATTENDANCE_REPORT,DELETE_ATTENDANCE_REPORT')
        where "name" = 'DELETE_ATTENDANCE_REPORT';
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
