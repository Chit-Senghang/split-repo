import { MigrationInterface, QueryRunner } from 'typeorm';

export class DownloadAttendanceGlobalConfiguration1701939725746
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
          INSERT INTO global_configuration (version, name, is_enable, value, type, data_type, description)
            VALUES  (1, 'retry-download-attendance-record', true, 1, 'ATTENDANCE', 'NUMBER', 'The fingerprint download will automatically retry many times depend on this config if the initial attempt fails. You will be notified if all attempts are unsuccessful.'),
                    (1, 'max-total-fingerprint-record-warning', true, 5000, 'ATTENDANCE', 'NUMBER', 'You will got the warning notification if total record in your device is more than this config. Then you need to delete finger print record of previous months.');`);
  }

  public async down(): Promise<void> {
    return;
  }
}
