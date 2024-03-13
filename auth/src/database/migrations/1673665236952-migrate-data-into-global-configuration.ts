import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateDataIntoGlobalConfiguration1673665236952
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "global_configuration"
      ALTER COLUMN "is_enable" SET NOT NULL;
      ALTER TABLE "global_configuration"
      ALTER COLUMN "is_system_defined" SET NOT NULL;
    `);
    await queryRunner.query(`
        ALTER TABLE "global_configuration"
        ALTER COLUMN "value" DROP NOT NULL
    `);
    await queryRunner.query(
      `INSERT INTO "global_configuration"
        (
          "name",
          "is_enable"
        )
      VALUES
        (
          'enable-employee-warning-reset-by-year',
          'TRUE'
        ),
        (
          'enable-employee-warning-reset-by-month',
          'TRUE'
        )
      ;`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
