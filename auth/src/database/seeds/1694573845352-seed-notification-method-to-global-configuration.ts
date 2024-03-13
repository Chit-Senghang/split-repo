import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedNotificationMethodToGlobalConfiguration1694573845352
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO global_configuration (version, name, is_enable, is_system_defined)
        VALUES (1, 'System Reporter Telegram Channel', true, false);
        INSERT INTO global_configuration (version, name, is_enable, is_system_defined)
        VALUES (1, 'System Reporter Email', true, false);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
