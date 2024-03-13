import { MigrationInterface, QueryRunner } from 'typeorm';

export class GlobalConfigurationModifiedIsNoValueToVarchar1697619845334
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE global_configuration ALTER COLUMN is_no_value TYPE VARCHAR(255)`
    );

    await queryRunner.query(
      `ALTER TABLE "global_configuration" RENAME COLUMN "is_no_value" TO "data_type"`
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
