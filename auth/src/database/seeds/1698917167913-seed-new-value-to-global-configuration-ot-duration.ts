import { MigrationInterface, QueryRunner } from 'typeorm';
import { GlobalConfigurationNameEnum } from '../../shared-resources/common/enum/global-configuration-name.enum';
import { GLOBAL_CONFIGURATION_DATATYPE } from '../../global-configuration/common/ts/enums/global-configuration-datatype.enum';

export class SeedNewValueToGlobalConfigurationOtDuration1698917167913
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TYPE config_type ADD VALUE IF NOT EXISTS 'OVERTIME_REQUEST';
    COMMIT;
  `);
    await queryRunner.query(`
      INSERT INTO "global_configuration" (name, value, is_enable, type, is_system_defined, data_type, regex, message)
      VALUES('${GlobalConfigurationNameEnum.OVERTIME_REQUEST_DURATION}', '10',true, (SELECT 'OVERTIME_REQUEST'::config_type), FALSE, 
      '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}', '^(?:[24680]|10|20|4[0-9]|[2468][02468])$', 'Value must be even number') ON CONFLICT DO NOTHING;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
