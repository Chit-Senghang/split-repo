import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUpdateRegexAndMessageToGlobalConfiguration1696993102751
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                UPDATE "global_configuration"
                SET "regex" = CASE
                                WHEN "name" = 'limit-upload-media-size' THEN '^(1-499|500)$'
                                WHEN "name" = 'payroll-generate-date' THEN '^[1-3][0-1]$'
                                WHEN "name" = 'allow-late-scan-in' THEN '^[1-9][0-9]?$'
                                WHEN "name" = 'allow-late-scan-out' THEN '^[1-9][0-9]?$'
                                WHEN "name" = 'allow-day-off-days' THEN '^[1-9][0-4]?$'
                                WHEN "name" = 'round-amount' THEN '^[0-4]$'
                                WHEN "name" = 'enable-strong-password' THEN '^.{8,255}$'
                                WHEN "name" = 'access-attempt-limit' THEN '^[1-9][0-9]{0,2}$'
                                WHEN "name" = 'access-attempt-lockout-duration' THEN '^[1-9][0-9]{0,3}$'
                                WHEN "name" = 'access-attempt-duration' THEN '^[1-9][0-9]{0,3}$'
                                WHEN "name" = 'exchange_rate' THEN '^[3-4][5][0-9]{2}$'
                                WHEN "name" = 'exchange_rate_nssf' THEN '^[3-4][5][0-9]{2}$'
                                WHEN "name" = 'employee-account-no-prefix' THEN '^.{1,5}$'
                                WHEN "name" = 'allow-second-scan-duration' THEN '^[1-9][0-9]?$'
                                WHEN "name" = 'allow-before-and-after-start-scan-duration' THEN '^[1-9][0-9]?$'
                                WHEN "name" = 'allow-before-and-after-end-scan-duration' THEN '^[1-9][0-9]?$'
                                WHEN "name" = 'allow-check-out-early' THEN '^[1-9][0-9]?$'
                                WHEN "name" = 'allow-miss-scan-time' THEN '^[1-9][0-9]?$'
                                WHEN "name" = 'attendance-allowance' THEN '^[1-9][0-9]?$'
                                WHEN "name" = 'telegram-token' THEN '^.{10,255}$'
                                WHEN "name" = 'telegram-chat-id' THEN '^.{10,255}$'
                                WHEN "name" = 'mail-host' THEN '^([a-zA-Z0-9-]+\\.)+([a-zA-Z]{2,64})$'
                                WHEN "name" = 'mail-port' THEN '^(?:[0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$'
                                WHEN "name" = 'mail-user' THEN '^[a-zA-Z0-9.!#$%&*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$'
                                WHEN "name" = 'mail-password' THEN '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()-+]).{8,255}$'
                                WHEN "name" = 'sms-username' THEN '^.{1,50}$'
                                WHEN "name" = 'sms-password' THEN '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()-+]).{8,255}$'
                                WHEN "name" = 'sms-sender' THEN '^[^\\s]{1,11}$'
                                WHEN "name" = 'sms-in' THEN '^[01]+$'
                                WHEN "name" = 'cd' THEN '^.{1,100}$'
                            END,
                    "message" = CASE
                                WHEN "name" = 'limit-upload-media-size' THEN 'Only numeric values are allowed, value must be between 1 - 500'
                                WHEN "name" = 'payroll-generate-date' THEN 'Only numeric values are allowed, value must be between 1 - 31'
                                WHEN "name" = 'allow-late-scan-in' THEN 'Only numeric values are allowed, value must be between 1 - 90'
                                WHEN "name" = 'allow-late-scan-out' THEN 'Only numeric values are allowed, value must be between 1 - 90'
                                WHEN "name" = 'allow-day-off-days' THEN 'Only numeric values are allowed, value must be between 1 - 15'
                                WHEN "name" = 'rount-amount' THEN 'Only numeric values are allowed, value must be between 0 - 4'
                                WHEN "name" = 'enable-strong-password' THEN 'Password must be at least 8 and less than or equal 255 characters'
                                WHEN "name" = 'access-attempt-limit' THEN 'Only numeric values are allowed, value must be between 1 - 1000'
                                WHEN "name" = 'access-attempt-lockout-duration' THEN 'Only numeric values are allowed, value must be between 1 - 10000'
                                WHEN "name" = 'access-attempt-duration' THEN 'Only numeric values are allowed, value must be between 1 - 10000'
                                WHEN "name" = 'exchange_rate' THEN 'Only numeric values are allowed, value must be between 3500 - 4500'
                                WHEN "name" = 'exchange_rate_nssf' THEN 'Only numeric values are allowed, value must be between 3500 - 4500'
                                WHEN "name" = 'employee-account-no-prefix' THEN 'Value me between 1 - 5 characters'
                                WHEN "name" = 'allow-second-scan-duration' THEN 'Only numeric values are allowed, value must be between 1 - 90'
                                WHEN "name" = 'allow-before-and-after-start-scan-duration' THEN 'Only numeric values are allowed, value must be between 1 - 90'
                                WHEN "name" = 'allow-before-and-after-end-scan-duration' THEN 'Only numeric values are allowed, value must be between 1 - 90'
                                WHEN "name" = 'allow-check-out-early' THEN 'Only numeric values are allowed, value must be between 1 - 90'
                                WHEN "name" = 'allow-miss-scan-time' THEN 'Only numeric values are allowed, value must be between 1 - 90'
                                WHEN "name" = 'attendance-allowance' THEN 'Only numeric values are allowed, value must be between 1 - 90'
                                WHEN "name" = 'telegram-token' THEN 'Value me be less than or equal to 255 characters'
                                WHEN "name" = 'telegram-chat-id' THEN 'Value me be less than or equal to 255 characters'
                                WHEN "name" = 'mail-host' THEN 'value must include one or more alphanumeric characters, hyphens, and dots, followed by a top-level domain of 2 - 64 characters'
                                WHEN "name" = 'mail-port' THEN 'value must be within the valid range of 0 to 65535'
                                WHEN "name" = 'mail-user' THEN 'value must be an email'
                                WHEN "name" = 'mail-password' THEN 'password must be at least 8 characters long and include a mix of uppercase and lowercase letters, numbers, and symbols'
                                WHEN "name" = 'sms-username' THEN 'Value must be between 1 - 50 characters'
                                WHEN "name" = 'sms-password' THEN 'password must be at least 8 characters long and include a mix of uppercase and lowercase letters, numbers, and symbols'
                                WHEN "name" = 'sms-sender' THEN 'Value must be between 1 - 11 characters'
                                WHEN "name" = 'sms-in' THEN 'Only value of 1 and 0 are allowed'
                                WHEN "name" = 'cd' THEN 'Value must be between 1 - 100 characters'
                            END`);
  }

  async down(): Promise<void> {
    return;
  }
}
