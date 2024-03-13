import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateDataIntoGlobalConfiguration1674445828092
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "user"
      SET "username" = 'system-defined'
      WHERE
        "username" = 'is_system-defined';
    `);
    await queryRunner.query(
      `
      INSERT INTO global_configuration
            (
            "name",
            "is_enable",
            "is_system_defined",
            "value",
            "updated_by"
            )
        VALUES
            (
            'employee_account_no_prefix',
            'TRUE',
            'TRUE',
            'EMP',
            (SELECT id FROM "user" WHERE "username" = 'system-defined')
            );`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
