import { MigrationInterface, QueryRunner } from 'typeorm';
import { GLOBAL_CONFIGURATION_DATATYPE } from '../../global-configuration/common/ts/enums/global-configuration-datatype.enum';

export class GlobalConfigSeedUpdateDataTypesToIsNoValue1697620899190
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "global_configuration"
            SET "data_type" = CASE
                            WHEN "name" = 'limit-upload-media-size' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'payroll-generate-date' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'allow-late-scan-in' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'allow-late-scan-out' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'allow-day-off-days' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'round-amount' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'access-attempt-limit' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'access-attempt-lockout-duration' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'access-attempt-duration' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'exchange_rate' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'exchange_rate_nssf' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'employee-account-no-prefix' THEN 'TEXT'
                            WHEN "name" = 'allow-second-scan-duration' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'allow-before-and-after-start-scan-duration' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'allow-before-and-after-end-scan-duration' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'allow-check-out-early' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'allow-miss-scan-time' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'attendance-allowance' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'telegram-token' THEN '${GLOBAL_CONFIGURATION_DATATYPE.PASSWORD}'
                            WHEN "name" = 'telegram-chat-id' THEN '${GLOBAL_CONFIGURATION_DATATYPE.TEXT}'
                            WHEN "name" = 'mail-host' THEN '${GLOBAL_CONFIGURATION_DATATYPE.EMAIL}'
                            WHEN "name" = 'mail-port' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'mail-user' THEN '${GLOBAL_CONFIGURATION_DATATYPE.EMAIL}'
                            WHEN "name" = 'mail-password' THEN '${GLOBAL_CONFIGURATION_DATATYPE.PASSWORD}'
                            WHEN "name" = 'sms-username' THEN '${GLOBAL_CONFIGURATION_DATATYPE.EMAIL}'
                            WHEN "name" = 'sms-password' THEN '${GLOBAL_CONFIGURATION_DATATYPE.PASSWORD}'
                            WHEN "name" = 'sms-sender' THEN '${GLOBAL_CONFIGURATION_DATATYPE.TEXT}'
                            WHEN "name" = 'sms-in' THEN '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}'
                            WHEN "name" = 'cd' THEN '${GLOBAL_CONFIGURATION_DATATYPE.TEXT}'
                            WHEN "name" = 'custom-data' THEN '${GLOBAL_CONFIGURATION_DATATYPE.TEXT}'
                            WHEN "name" = 'real-time-notification' THEN '${GLOBAL_CONFIGURATION_DATATYPE.BOOLEAN}'
                            WHEN "name" = 'enable-employee-warning-reset-by-year' THEN '${GLOBAL_CONFIGURATION_DATATYPE.BOOLEAN}'
                            WHEN "name" = 'enable-employee-warning-reset-by-month' THEN '${GLOBAL_CONFIGURATION_DATATYPE.BOOLEAN}'
                            WHEN "name" = 'enable-strong-password' THEN '${GLOBAL_CONFIGURATION_DATATYPE.BOOLEAN}'
                            WHEN "name" = 'email-notification' THEN '${GLOBAL_CONFIGURATION_DATATYPE.BOOLEAN}'
                        END
                        WHERE "name" IN (
                            'limit-upload-media-size',
                            'payroll-generate-date',
                            'allow-late-scan-in',
                            'allow-late-scan-out',
                            'allow-day-off-days',
                            'round-amount',
                            'access-attempt-limit',
                            'access-attempt-lockout-duration',
                            'access-attempt-duration',
                            'exchange_rate',
                            'exchange_rate_nssf',
                            'employee-account-no-prefix',
                            'allow-second-scan-duration',
                            'allow-before-and-after-start-scan-duration',
                            'allow-before-and-after-end-scan-duration',
                            'allow-check-out-early',
                            'allow-miss-scan-time',
                            'attendance-allowance',
                            'telegram-token',
                            'telegram-chat-id',
                            'mail-host',
                            'mail-port',
                            'mail-user',
                            'mail-password',
                            'sms-username',
                            'sms-password',
                            'sms-sender',
                            'sms-in',
                            'cd',
                            'real-time-notification',
                            'enable-employee-warning-reset-by-year',
                            'enable-employee-warning-reset-by-month',
                            'enable-strong-password',
                            'custom-data',
                            'email-notification'
                        )
                `);
  }

  public async down(): Promise<void> {
    return;
  }
}
