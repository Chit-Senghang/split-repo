import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGlobalConfig1693800942628 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO global_configuration (version, name, is_enable, value, type)
        VALUES (1, 'allow-second-scan-duration', true, 60, 'ATTENDANCE');
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
