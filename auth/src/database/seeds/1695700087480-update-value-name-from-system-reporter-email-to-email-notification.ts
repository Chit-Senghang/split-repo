import { MigrationInterface, QueryRunner } from 'typeorm';
import * as cryptojs from 'cryptojs';

export class UpdateValueNameFromSystemReporterEmailToEmailNotification1695700087480
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    const crypto = cryptojs.Crypto.DES;
    await queryRunner.query(`
    ALTER TYPE config_type ADD VALUE IF NOT EXISTS 'TELEGRAM';
    COMMIT;
  `);

    await queryRunner.query(`
          UPDATE "global_configuration"
          SET name = 'telegram-token', 
              value = '${crypto.encrypt(
                '6406605461:AAEETgdlRfFcgijII7fk6OcnoWpwje79aVI',
                'telegram-token'
              )}',
              type = (SELECT 'TELEGRAM'::config_type),
              is_system_defined = false
          WHERE name = 'System Reporter Telegram Channel';
          
          INSERT INTO "global_configuration" (name,is_enable, value, type, is_system_defined) 
                                     VALUES('telegram-chat-id', true, '${crypto.encrypt(
                                       '-1001929890853',
                                       'telegram-chat-id'
                                     )}', (SELECT 'TELEGRAM'::config_type), false) ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
    ALTER TYPE config_type ADD VALUE IF NOT EXISTS 'EMAIL';
    COMMIT;
  `);

    await queryRunner.query(`
        UPDATE "global_configuration" 
        SET name = 'email-notification',
            type = (SELECT 'EMAIL'::config_type),
            is_system_defined = false
        WHERE name = 'System Reporter Email';

        INSERT INTO "global_configuration" (name,is_enable, value, type, is_system_defined)
                                VALUES
                                     ('mail-host', true, 'smtp.gmail.com', (SELECT 'EMAIL'::config_type), false),
                                     ('mail-port', true, '465', (SELECT 'EMAIL'::config_type), false),
                                     ('mail-user', true, 'jonhd8529@gmail.com', (SELECT 'EMAIL'::config_type), false),
                                     ('mail-password', true, '${crypto.encrypt(
                                       'umiuwkqpqhufopmt',
                                       'mail-password'
                                     )}', (SELECT 'EMAIL'::config_type), false) ON CONFLICT DO NOTHING;
  `);
  }

  async down(): Promise<void> {
    return;
  }
}
