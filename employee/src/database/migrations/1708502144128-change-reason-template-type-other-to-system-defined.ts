import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeReasonTemplateTypeOtherToSystemDefined1708502144128
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE reason_template
        SET is_system_defined = true
        WHERE type = 'OTHER';
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
