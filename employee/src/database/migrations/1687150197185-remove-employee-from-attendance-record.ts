import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEmployeeFromAttendanceRecord1687150197185
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        alter table attendance_record
        drop column employee_id;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
