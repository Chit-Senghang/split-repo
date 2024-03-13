import { MigrationInterface, QueryRunner } from 'typeorm';

export class GlobalConfigurationAddIsNoValueColumn1697598761500
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE global_configuration ADD COLUMN is_no_value BOOLEAN DEFAULT false`
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
