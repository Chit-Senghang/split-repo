import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnNameKhmerToBenefitComponent1692329430559
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
        ALTER TABLE benefit_component
        Add name_khmer varchar(255);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
