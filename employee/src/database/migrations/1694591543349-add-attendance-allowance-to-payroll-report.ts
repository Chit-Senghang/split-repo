import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttendanceAllowanceToPayrollReport1694591543349
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        ALTER TABLE payroll_report 
        ADD COLUMN attendance_allowance INTEGER;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
