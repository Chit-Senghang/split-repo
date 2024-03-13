import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGlobalConfigurationUpdateEmailNotificationToEmailType1698220512497
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "global_configuration" 
            SET 
                "data_type" = 'EMAIL', 
                "regex" = '^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$',
                "message" = 'Value must be an email'
            WHERE "name" = 'email-notification'
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
