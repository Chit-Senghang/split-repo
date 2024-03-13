import { MigrationInterface, QueryRunner } from 'typeorm';

export class GlobalConfigurationAddRegexAndMessage1696932290802
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE global_configuration ADD COLUMN regex VARCHAR(255), ADD COLUMN message  VARCHAR(255)`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
