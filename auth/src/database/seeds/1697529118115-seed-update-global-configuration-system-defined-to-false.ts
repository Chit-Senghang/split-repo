import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUpdateGlobalConfigurationSystemDefinedToFalse1697529118115
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                UPDATE "global_configuration" SET "is_system_defined" = false
                WHERE "name" IN (
                    'allow-check-out-early',
                    'allow-before-and-after-start-scan-duration',
                    'allow-before-and-after-end-scan-duration',
                    'limit-upload-media-size'
                  )
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
