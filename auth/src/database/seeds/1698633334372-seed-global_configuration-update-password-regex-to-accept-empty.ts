import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGlobalConfigurationUpdatePasswordRegexToAcceptEmpty1698633334372
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "global_configuration" SET "regex" = '^$|^(?:[\\x00-\\xFF]{1,255})$', "message" = 'Password must be less than 255 characters' WHERE "data_type" = 'PASSWORD'
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
