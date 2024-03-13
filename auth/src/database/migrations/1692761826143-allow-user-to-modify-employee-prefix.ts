import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowUserToModifyEmployeePrefix1692761826143
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE global_configuration
        SET is_system_defined = 'false'
        WHERE name = 'employee-account-no-prefix';
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
