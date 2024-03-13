import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGlobalConfigurationToUpdateRegex1697699261186
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "global_configuration" 
                SET "regex" = 
                CASE 
                    WHEN "name" = 'limit-upload-media-size' THEN '^(?:[1-9]|[1-9][0-9]|[1-4][0-9]{2}|500)$'
                    WHEN "name" = 'sms-password' THEN '^.{8,255}$'
                    WHEN "name" = 'telegram-token' THEN '^.{8,255}$'
                    WHEN "name" = 'mail-password' THEN '^.{8,255}$'
                    WHEN "name" = 'custom-data' THEN '^.{1,100}$'
                END,
                    "message" = 
                CASE 
                    WHEN "name" = 'limit-upload-media-size' THEN 'Only numeric values are allowed, value must be between 1 - 500'
                    WHEN "name" = 'sms-password' THEN 'Password must be between 8 - 255 characters long'
                    WHEN "name" = 'telegram-token' THEN 'Password must be between 8 - 255 characters long'
                    WHEN "name" = 'mail-password' THEN 'Password must be between 8 - 255 characters long'
                    WHEN "name" = 'custom-data' THEN 'Value must be between 1 - 100 characters'
                END
                WHERE "name" IN(
                    'limit-upload-media-size',
                    'sms-password',
                    'telegram-token',
                    'mail-password',
                    'custom-data'
                )
          `
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
