import { MigrationInterface, QueryRunner } from 'typeorm';

export class newPermissionAttendanceModule1674010001296
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //*Attendance Parent Tree
    await queryRunner.query(`
    INSERT INTO "permission" (version, "name")
    VALUES (2, 'ATTENDANCE_MODULE');
`);
    await queryRunner.query(`
    UPDATE
    "permission"
    SET
    mpath = get_permission_mpath('ATTENDANCE_MODULE')
    WHERE name = 'ATTENDANCE_MODULE';
`);
  }

  async down(): Promise<void> {
    return;
  }
}
