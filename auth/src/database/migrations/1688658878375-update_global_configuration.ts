import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGlobalConfiguration1688658878375
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        UPDATE global_configuration SET name = 'employee-account-no-prefix' WHERE name = 'employee_account_no_prefix';
        UPDATE global_configuration SET name = 'allow-late-scan-in', type = 'ATTENDANCE' WHERE name = 'allow_late_scan_in';
        UPDATE global_configuration SET name = 'allow-late-scan-out', type = 'ATTENDANCE' WHERE name = 'allow_late_scan_out';
        UPDATE global_configuration SET type = 'LEAVE' WHERE name = 'allow-day-off-days';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
