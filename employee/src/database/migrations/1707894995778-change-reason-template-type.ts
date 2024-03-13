import { MigrationInterface, QueryRunner } from 'typeorm';
import { ReasonTemplateTypeEnum } from '../../reason-template/common/ts/enum/type.enum';

export class ChangeReasonTemplateType1707894995778
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //ADD: is system defined
    await queryRunner.query(`
        ALTER TABLE reason_template
        ADD COLUMN is_system_defined BOOLEAN DEFAULT(false);
    `);

    //SET: type of other reason template to OTHER and is system defined = true
    await queryRunner.query(`
        UPDATE reason_template
        SET type = '${ReasonTemplateTypeEnum.OTHER}',
            is_system_defined = true
        WHERE name = 'ផ្សេងៗ។ Other'
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
