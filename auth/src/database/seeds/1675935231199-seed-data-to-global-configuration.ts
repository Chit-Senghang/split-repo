import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedDataToGlobalConfiguration1675935231199
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO global_configuration
                (
                "name",
                "is_enable",
                "is_system_defined",
                "description",
                "value",
                "updated_by"
                )
            VALUES
                (
                'limit-upload-media-size',
                'TRUE',
                'TRUE',
                'File size is megabyte',
                '10',
                (SELECT id FROM "user" WHERE "username" = 'system-defined')
                );`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
