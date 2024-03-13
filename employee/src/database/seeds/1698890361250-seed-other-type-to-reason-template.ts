import { MigrationInterface, QueryRunner } from 'typeorm';
import { ReasonTemplateTypeEnum } from '../../reason-template/common/ts/enum/type.enum';

export class SeedOtherTypeToReasonTemplate1698890361250
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO reason_template (type, name)
        VALUES ('${ReasonTemplateTypeEnum.OTHER}', 'Other');
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
