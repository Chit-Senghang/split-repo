import { MigrationInterface, QueryRunner } from 'typeorm';

export class RedownloadFingerpirntData1696693419085
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        DELETE FROM attendance_record;
        UPDATE company_structure SET last_retrieve_date = NULL WHERE fingerprint_device_id > 0;
        DELETE FROM request_work_flow_type where request_type IN ('SALARY_ADJUSTMENT', 'PAYROLL_BENEFIT', 'BORROW/PAYBACK_HOUR');
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
