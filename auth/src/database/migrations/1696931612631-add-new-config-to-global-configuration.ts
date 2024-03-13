import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewConfigToGlobalConfiguration1696931612631
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "global_configuration" (name,is_enable, value, type, is_system_defined) 
        VALUES('custom-data', true, 'HRM', (SELECT 'SMS'::config_type), false);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
