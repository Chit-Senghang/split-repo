import { MigrationInterface, QueryRunner } from 'typeorm';
import { GlobalConfigurationNameEnum } from '../../shared-resources/common/enum/global-configuration-name.enum';
import { GLOBAL_CONFIGURATION_DATATYPE } from '../../global-configuration/common/ts/enums/global-configuration-datatype.enum';

export class RemoveDuplicationScanTimeInMinute1698482430116
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        INSERT INTO global_configuration (name , value, is_enable, description, type, data_type, regex, message)
            VALUES ('${GlobalConfigurationNameEnum.REMOVE_DUPLICATION_SCAN_TIME_IN_MINUTE}',
                5, true, 'To remove next scan if the duration is smaller than this config','ATTENDANCE', 
                '${GLOBAL_CONFIGURATION_DATATYPE.NUMBER}', '^[1-6][0-9]$', 'Please enter a number between 1 and 60');
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
