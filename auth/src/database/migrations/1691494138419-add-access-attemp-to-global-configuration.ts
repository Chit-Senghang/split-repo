import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccessAttempToGlobalConfiguration1691494138419
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE config_type ADD VALUE IF NOT EXISTS 'SECURITY';
        COMMIT;
    `);

    await queryRunner.query(`
        UPDATE global_configuration
        SET type = 'SECURITY'
        WHERE name = 'enable-strong-password';

        INSERT INTO global_configuration (name , value, is_enable, description, type)
        VALUES ('access-attempt-limit', 5, true, 'access attempt limit', 'SECURITY' );

        INSERT INTO global_configuration (name , value, is_enable, description, type)
        VALUES ('access-attempt-lockout-duration', 3600, true, 'access attempt limit is in second', 'SECURITY' );

        INSERT INTO global_configuration (name , value, is_enable, description, type)
        VALUES ('access-attempt-duration', 1, true, 'access attempt limit is in hour', 'SECURITY' );
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
