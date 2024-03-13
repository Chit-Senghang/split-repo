import { MigrationInterface, QueryRunner } from 'typeorm';

export class GlobalConfigType1685069452251 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        
        create type config_type as enum ('LEAVE','ATTENDANCE','PAYROLL','EMPLOYEE');

        alter table global_configuration 
        add column "type" config_type default null;

        update global_configuration 
        set "type" = 'EMPLOYEE'
        where name in ('enable-employee-warning-reset-by-year', 'enable-employee-warning-reset-by-month', 'employee_account_no_prefix');

        update global_configuration 
        set "type" = 'ATTENDANCE'
        where name in ('allow-miss-scan-time');

        update global_configuration 
        set "type" = 'LEAVE'
        where name in ('allow-day-off-days');`);
  }

  public async down(): Promise<void> {
    return;
  }
}
