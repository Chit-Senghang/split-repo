import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBenefitComponentColumnNameKhmerIsSystemDefined1692590516255
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
      UPDATE
        benefit_component
      SET
        name_khmer = 'ប្រាក់ខែគោល'
      WHERE
        is_system_defined = true
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
