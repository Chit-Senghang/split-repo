import { MigrationInterface, QueryRunner } from 'typeorm';
import { GlobalConfigurationNameEnum } from '../../shared-resources/common/enum/global-configuration-name.enum';
import { GLOBAL_CONFIGURATION_DATATYPE } from '../../global-configuration/common/ts/enums/global-configuration-datatype.enum';

export class SeedNewValueToGlobalConfigurationWithSmsType1697855696670
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "global_configuration" (name, value, is_enable, type, is_system_defined, data_type)
      VALUES('${GlobalConfigurationNameEnum.SMS_SERVER_URL}', 'https://sandbox.mekongsms.com/api/sendsms.aspx',
       true, (SELECT 'SMS'::config_type), FALSE, '${GLOBAL_CONFIGURATION_DATATYPE.TEXT}') ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
    INSERT INTO "global_configuration" (name, value, is_enable, type, is_system_defined, data_type)
    VALUES('${GlobalConfigurationNameEnum.ENABLE_TELEGRAM_NOTIFICATION}','','false',(SELECT 'TELEGRAM'::config_type), FALSE, '${GLOBAL_CONFIGURATION_DATATYPE.BOOLEAN}')
     ON CONFLICT DO NOTHING;
  `);
  }

  async down(): Promise<void> {
    return;
  }
}
