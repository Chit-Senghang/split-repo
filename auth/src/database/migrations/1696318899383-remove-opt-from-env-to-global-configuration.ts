import { MigrationInterface, QueryRunner } from 'typeorm';
import * as cryptojs from 'cryptojs';

export class RemoveOptFromEnvToGlobalConfiguration1696318899383
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    const crypto = cryptojs.Crypto.DES;
    await queryRunner.query(`
    ALTER TYPE config_type ADD VALUE IF NOT EXISTS 'SMS';
    COMMIT;
  `);
    await queryRunner.query(`
    INSERT INTO "global_configuration" (name,is_enable, value, type, is_system_defined)
    VALUES
         ('sms-username', true, 'igtech_api@apitest', (SELECT 'SMS'::config_type), false),
         ('sms-password', true, '${crypto.encrypt(
           'c0f4f3bbf667cd1d2056c5c6fc6019ab',
           'sms-password'
         )}', (SELECT 'SMS'::config_type), false),
         ('sms-sender', true, 'SMS Testing', (SELECT 'SMS'::config_type), false),
         ('sms-in', true, '0', (SELECT 'SMS'::config_type), false) ON CONFLICT DO NOTHING;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
