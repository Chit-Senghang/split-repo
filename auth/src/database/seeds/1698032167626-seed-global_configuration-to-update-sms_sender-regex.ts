import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGlobalConfigurationToUpdateSmsSenderRegex1698032167626
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE global_configuration 
        SET "regex" = 
        CASE
          WHEN "name" = 'telegram-chat-id' THEN '^.{1,255}$'
          WHEN "name" = 'sms-sender' THEN '^.{1,11}$'
        END
        WHERE "name" IN(
            'telegram-chat-id', 
            'sms-sender'
        );

    `);

    await queryRunner.query(`
        UPDATE global_configuration 
        SET "message" = 
        CASE 
            WHEN "name" = 'telegram-chat-id' THEN 'Value must be between 1 - 255 characters'
            WHEN "name" = 'employee-account-no-prefix' THEN 'Value must be between 1 - 5 characters'
            WHEN "name" = 'sms-sender' THEN 'Value must be between 1 - 11 characters'
        END
        WHERE "name" IN(
            'sms-sender',
            'telegram-chat-id', 
            'employee-account-no-prefix'
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
