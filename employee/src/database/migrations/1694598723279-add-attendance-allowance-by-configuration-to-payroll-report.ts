import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttendanceAllowanceByConfigurationToPayrollReport1694598723279
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        ALTER TABLE payroll_report 
        ADD COLUMN attendance_allowance_by_configuration INTEGER;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
